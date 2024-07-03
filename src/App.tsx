import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { useCustomFetch } from "./hooks/useCustomFetch"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee, SetTransactionApprovalParams } from "./utils/types"

export function App() {
  const { data: employees, loading: loadingEmployees, ...employeeUtils } = useEmployees()
  const {
    data: paginatedTransactions,
    loading: loadingPaginatedTransactions,
    ...paginatedTransactionsUtils
  } = usePaginatedTransactions()
  const {
    data: transactionsByEmployee,
    loading: loadingTransactionsByEmployee,
    ...transactionsByEmployeeUtils
  } = useTransactionsByEmployee()
  const { fetchWithoutCache } = useCustomFetch()

  const [transactionApprovals, setTransactionApprovals] = useState<Record<string, boolean>>({})

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  const loadAllTransactions = useCallback(async () => {
    transactionsByEmployeeUtils.invalidateData()
    await employeeUtils.fetchAll()
    await paginatedTransactionsUtils.fetchAll()
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string | null) => {
      if (employeeId === null) {
        await loadAllTransactions()
        return
      }

      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils, loadAllTransactions]
  )

  const setTransactionApproval = useCallback(
    async (transactionId: string, newValue: boolean) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })
      setTransactionApprovals((prevApprovals) => ({
        ...prevApprovals,
        [transactionId]: newValue,
      }))
    },
    [fetchWithoutCache]
  )

  useEffect(() => {
    if (employees === null && !loadingEmployees) {
      loadAllTransactions()
    }
  }, [loadingEmployees, employees, loadAllTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={loadingEmployees}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null || newValue.id === EMPTY_EMPLOYEE.id) {
              await loadTransactionsByEmployee(null)
            } else {
              await loadTransactionsByEmployee(newValue.id)
            }
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions
            transactions={transactions}
            transactionApprovals={transactionApprovals}
            setTransactionApproval={setTransactionApproval}
          />

          {paginatedTransactions !== null && paginatedTransactions.nextPage !== null && (
            <button
              className="RampButton"
              disabled={loadingPaginatedTransactions}
              onClick={async () => {
                await paginatedTransactionsUtils.fetchAll()
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
