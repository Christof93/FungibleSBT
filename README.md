# FungibleSBT
An interpretaion of a smart contract for a fungible Soulbound Token (SBT).

Test
---

Install truffle, openzeppelin and ganache
```
npm install -g truffle
npm install @openzeppelin/contracts
npm install -g ganache
```
Inittialize
```
truffle init
```

Compile

```
truffle compile
```

Test

```
truffle test --network development
```

Deploy
```
truffle migrate --reset --network FungibleSBT 
```
