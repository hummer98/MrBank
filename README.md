# Mr.Bank

Mr.Bank is an accounting system.
Designed for high security, high availability and high throughput.

- [x] High availability
- [x] High throughput
- [x] High security

## Architecture

__Account__
```
/account/v1/accounts/{uid}
```

```
/account/v1/accounts/{uid}/balances/{currency}/{shard}
```

```
/account/v1/accounts/{uid}/years/{year}/months/{month}/dates/{date}/transactions/{transaction}
```

__Configuration__
```
/account/v1/configurations/{uid}
```


### Deposit

### Withdraw

### Transfer



