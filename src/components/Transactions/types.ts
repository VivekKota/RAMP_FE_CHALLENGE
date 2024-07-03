import { FunctionComponent } from "react"
import { Transaction } from "../../utils/types"

export type SetTransactionApprovalFunction = (transactionId: string, newValue: boolean) => Promise<void>

type TransactionsProps = {
  transactions: Transaction[] | null
  transactionApprovals: Record<string, boolean>
  setTransactionApproval: SetTransactionApprovalFunction
}

type TransactionPaneProps = {
  transaction: Transaction
  loading: boolean
  approved: boolean
  setTransactionApproval: SetTransactionApprovalFunction
}

export type TransactionsComponent = FunctionComponent<TransactionsProps>
export type TransactionPaneComponent = FunctionComponent<TransactionPaneProps>
