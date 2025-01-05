;; CMB Pattern NFT Contract

(define-non-fungible-token cmb-pattern uint)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_PATTERN (err u101))

;; Data variables
(define-data-var last-token-id uint u0)

;; Data maps
(define-map token-metadata
  uint
  {
    creator: principal,
    name: (string-ascii 64),
    description: (string-utf8 256),
    image-url: (string-ascii 256),
    discovery-date: uint
  }
)

;; Public functions
(define-public (mint-pattern (name (string-ascii 64)) (description (string-utf8 256)) (image-url (string-ascii 256)))
  (let
    (
      (token-id (+ (var-get last-token-id) u1))
    )
    (try! (nft-mint? cmb-pattern token-id tx-sender))
    (map-set token-metadata
      token-id
      {
        creator: tx-sender,
        name: name,
        description: description,
        image-url: image-url,
        discovery-date: block-height
      }
    )
    (var-set last-token-id token-id)
    (ok token-id)
  )
)

(define-public (transfer-pattern (token-id uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender (unwrap! (nft-get-owner? cmb-pattern token-id) ERR_INVALID_PATTERN)) ERR_NOT_AUTHORIZED)
    (try! (nft-transfer? cmb-pattern token-id tx-sender recipient))
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-pattern-metadata (token-id uint))
  (map-get? token-metadata token-id)
)

(define-read-only (get-pattern-owner (token-id uint))
  (nft-get-owner? cmb-pattern token-id)
)

(define-read-only (get-last-token-id)
  (var-get last-token-id)
)

