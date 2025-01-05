;; Data Analysis Management Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_TASK (err u101))
(define-constant ERR_INVALID_RESULT (err u102))

;; Data variables
(define-data-var task-count uint u0)
(define-data-var result-count uint u0)

;; Data maps
(define-map tasks
  uint
  {
    creator: principal,
    description: (string-utf8 1024),
    status: (string-ascii 20),
    assigned-to: (optional principal),
    deadline: uint
  }
)

(define-map results
  uint
  {
    task-id: uint,
    analyst: principal,
    data: (string-utf8 2048),
    timestamp: uint,
    verified: bool
  }
)

;; Public functions
(define-public (create-task (description (string-utf8 1024)) (deadline uint))
  (let
    (
      (task-id (+ (var-get task-count) u1))
    )
    (map-set tasks
      task-id
      {
        creator: tx-sender,
        description: description,
        status: "open",
        assigned-to: none,
        deadline: deadline
      }
    )
    (var-set task-count task-id)
    (ok task-id)
  )
)

(define-public (assign-task (task-id uint) (analyst principal))
  (let
    (
      (task (unwrap! (map-get? tasks task-id) ERR_INVALID_TASK))
    )
    (asserts! (is-eq (get status task) "open") ERR_INVALID_TASK)
    (ok (map-set tasks
      task-id
      (merge task {
        status: "assigned",
        assigned-to: (some analyst)
      })
    ))
  )
)

(define-public (submit-result (task-id uint) (data (string-utf8 2048)))
  (let
    (
      (task (unwrap! (map-get? tasks task-id) ERR_INVALID_TASK))
      (result-id (+ (var-get result-count) u1))
    )
    (asserts! (is-eq (some tx-sender) (get assigned-to task)) ERR_NOT_AUTHORIZED)
    (map-set results
      result-id
      {
        task-id: task-id,
        analyst: tx-sender,
        data: data,
        timestamp: block-height,
        verified: false
      }
    )
    (var-set result-count result-id)
    (ok result-id)
  )
)

(define-public (verify-result (result-id uint) (is-valid bool))
  (let
    (
      (result (unwrap! (map-get? results result-id) ERR_INVALID_RESULT))
      (task (unwrap! (map-get? tasks (get task-id result)) ERR_INVALID_TASK))
    )
    (asserts! (is-eq tx-sender (get creator task)) ERR_NOT_AUTHORIZED)
    (ok (map-set results
      result-id
      (merge result { verified: is-valid })
    ))
  )
)

;; Read-only functions
(define-read-only (get-task (task-id uint))
  (map-get? tasks task-id)
)

(define-read-only (get-result (result-id uint))
  (map-get? results result-id)
)

(define-read-only (get-task-count)
  (var-get task-count)
)

(define-read-only (get-result-count)
  (var-get result-count)
)

