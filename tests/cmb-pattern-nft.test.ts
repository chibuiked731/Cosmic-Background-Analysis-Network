import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let lastTokenId = 0;
const tokenMetadata = new Map();
const tokenOwners = new Map();

// Simulated contract functions
function mintPattern(name: string, description: string, imageUrl: string, creator: string) {
  const tokenId = ++lastTokenId;
  tokenMetadata.set(tokenId, {
    creator,
    name,
    description,
    imageUrl,
    discoveryDate: Date.now()
  });
  tokenOwners.set(tokenId, creator);
  return tokenId;
}

function transferPattern(tokenId: number, sender: string, recipient: string) {
  if (tokenOwners.get(tokenId) !== sender) throw new Error('Not authorized');
  tokenOwners.set(tokenId, recipient);
  return true;
}

describe('CMB Pattern NFT Contract', () => {
  beforeEach(() => {
    lastTokenId = 0;
    tokenMetadata.clear();
    tokenOwners.clear();
  });
  
  it('should mint a new CMB pattern NFT', () => {
    const id = mintPattern('Cosmic Web', 'A unique pattern in the CMB resembling a cosmic web', 'https://example.com/cosmic-web.jpg', 'scientist1');
    expect(id).toBe(1);
    const metadata = tokenMetadata.get(id);
    expect(metadata.name).toBe('Cosmic Web');
    expect(tokenOwners.get(id)).toBe('scientist1');
  });
  
  it('should transfer CMB pattern NFT ownership', () => {
    const id = mintPattern('Dark Flow', 'A pattern suggesting a dark flow in the CMB', 'https://example.com/dark-flow.jpg', 'scientist2');
    expect(transferPattern(id, 'scientist2', 'collector1')).toBe(true);
    expect(tokenOwners.get(id)).toBe('collector1');
  });
  
  it('should not allow unauthorized transfers', () => {
    const id = mintPattern('Cold Spot', 'A mysterious cold spot in the CMB', 'https://example.com/cold-spot.jpg', 'scientist3');
    expect(() => transferPattern(id, 'unauthorized_user', 'collector2')).toThrow('Not authorized');
  });
});

