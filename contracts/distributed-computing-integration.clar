;; Distributed Computing Integration Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_COMPUTATION (err u101))

;; Data variables
(define-data-var computation-count uint u0)

;; Data maps
(define-map computations
  uint
  {
    task-id: uint,
    node: principal,
    input-data: (string-utf8 1024),
    output-data: (optional (string-utf8 1024)),
    status: (string-ascii 20),
    start-time: uint,
    end-time: (optional uint)
  }
)

;; Public functions
(define-public (start-computation (task-id uint) (input-data (string-utf8 1024)))
  (let
    (
      (computation-id (+ (var-get computation-count) u1))
    )
    (map-set computations
      computation-id
      {
        task-id: task-id,
        node: tx-sender,
        input-data: input-data,
        output-data: none,
        status: "in-progress",
        start-time: block-height,
        end-time: none
      }
    )
    (var-set computation-count computation-id)
    (ok computation-id)
  )
)

(define-public (submit-computation-result (computation-id uint) (output-data (string-utf8 1024)))
  (let
    (
      (computation (unwrap! (map-get? computations computation-id) ERR_INVALID_COMPUTATION))
    )
    (asserts! (is-eq tx-sender (get node computation)) ERR_NOT_AUTHORIZED)
    (ok (map-set computations
      computation-id
      (merge computation {
        output-data: (some output-data),
        status: "completed",
        end-time: (some block-height)
      })
    ))
  )
)

(define-public (validate-computation (computation-id uint) (is-valid bool))
  (let
    (
      (computation (unwrap! (map-get? computations computation-id) ERR_INVALID_COMPUTATION))
    )
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (ok (map-set computations
      computation-id
      (merge computation {
        status: (if is-valid "validated" "rejected")
      })
    ))
  )
)

;; Read-only functions
(define-read-only (get-computation (computation-id uint))
  (map-get? computations computation-id)
)

(define-read-only (get-computation-count)
  (var-get computation-count)
)

