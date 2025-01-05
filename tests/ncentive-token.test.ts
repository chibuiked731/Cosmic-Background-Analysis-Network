import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
const balances = new Map();
let totalSupply = 0;

// Simulated contract functions
function mint(amount: number, recipient: string, minter: string) {
  if (minter !== 'CONTRACT_OWNER') throw new Error('Not authorized');
  const currentBalance = balances.get(recipient) || 0;
  balances.set(recipient, currentBalance + amount);
  totalSupply += amount;
  return true;
}

function transfer(amount: number, sender: string, recipient: string) {
  const senderBalance = balances.get(sender) || 0;
  if (senderBalance < amount) throw new Error('Insufficient balance');
  balances.set(sender, senderBalance - amount);
  const recipientBalance = balances.get(recipient) || 0;
  balances.set(recipient, recipientBalance + amount);
  return true;
}

function burn(amount: number, owner: string) {
  const currentBalance = balances.get(owner) || 0;
  if (currentBalance < amount) throw new Error('Insufficient balance');
  balances.set(owner, currentBalance - amount);
  totalSupply -= amount;
  return true;
}

describe('Incentive Token Contract', () => {
  beforeEach(() => {
    balances.clear();
    totalSupply = 0;
  });
  
  it('should mint new tokens', () => {
    expect(mint(1000, 'user1', 'CONTRACT_OWNER')).toBe(true);
    expect(balances.get('user1')).toBe(1000);
    expect(totalSupply).toBe(1000);
  });
  
  it('should transfer tokens between users', () => {
    mint(1000, 'user1', 'CONTRACT_OWNER');
    expect(transfer(500, 'user1', 'user2')).toBe(true);
    expect(balances.get('user1')).toBe(500);
    expect(balances.get('user2')).toBe(500);
  });
  
  it('should burn tokens', () => {
    mint(1000, 'user1', 'CONTRACT_OWNER');
    expect(burn(300, 'user1')).toBe(true);
    expect(balances.get('user1')).toBe(700);
    expect(totalSupply).toBe(700);
  });
  
  it('should not allow unauthorized minting', () => {
    expect(() => mint(1000, 'user1', 'unauthorized_user')).toThrow('Not authorized');
  });
  
  it('should not allow transfers with insufficient balance', () => {
    mint(500, 'user1', 'CONTRACT_OWNER');
    expect(() => transfer(1000, 'user1', 'user2')).toThrow('Insufficient balance');
  });
  
  it('should not allow burning more tokens than owned', () => {
    mint(500, 'user1', 'CONTRACT_OWNER');
    expect(() => burn(1000, 'user1')).toThrow('Insufficient balance');
  });
});

