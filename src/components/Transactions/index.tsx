import { useCustomFetch } from "src/hooks/useCustomFetch"
import { TransactionPane } from "./TransactionPane"
import { TransactionsComponent } from "./types"

export const Transactions: TransactionsComponent = ({
  transactions,
  transactionApprovals,
  setTransactionApproval,
}) => {
  const { loading } = useCustomFetch()

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          approved={transactionApprovals[transaction.id] ?? transaction.approved}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  )
}
