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

__AccountConfiguration__
```
/account/v1/accountConfigurations/{uid}
```

__Bank__
```
/account/v1/banks/{uid}
```

```
/account/v1/banks/{uid}/years/{year}/months/{month}/dates/{date}/transactions/{transaction}
```

```
/account/v1/banks/{uid}/years/{year}/months/{month}/dates/{date}/balances/{currency}
```

```
/account/v1/banks/{uid}/years/{year}/months/{month}/balances/{currency}
```

```
/account/v1/banks/{uid}/years/{year}/balances/{currency}
```

```
/account/v1/banks/{uid}/balances/{currency}
```

__BankConfiguration__
```
/account/v1/bankConfigurations/{uid}
```


### Transfer

Account  <->  Account

POST `/v1/accounts/{account}`

### Deposit

Account  ->  Bank/Branch

POST `/v1/banks/{bank}/branches/{branch}`

### Withdraw

Bank/Branch  ->  Account

POST `/v1/banks/{bank}/branches/{branch}`
