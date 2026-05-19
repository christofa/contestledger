"use client"

import { ccc } from "@ckb-ccc/connector-react"

export default function CKBProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ccc.Provider defaultClient={new ccc.ClientPublicTestnet()}>
      {children}
    </ccc.Provider>
  )
}
