// Fetches a real transaction from CKB testnet and parses its Cell data

const CKB_RPC = "https://testnet.ckb.dev/rpc"

// ── Raw RPC call ───────────────────────────────────────────────────────────────

async function ckbRpc(method: string, params: unknown[]) {
  const res = await fetch(CKB_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id: 1,
    }),
  })

  const json = await res.json()

  if (json.error) {
    throw new Error(`CKB RPC error: ${json.error.message}`)
  }

  return json.result
}

// ── Fetch a transaction by hash ───────────────────────────────────────────────

export async function fetchCkbTransaction(txHash: string) {
  const result = await ckbRpc("get_transaction", [txHash])

  if (!result || !result.transaction) {
    throw new Error(`Transaction not found on CKB testnet: ${txHash}`)
  }

  return result.transaction
}

// ── Parse Cell data from a transaction ───────────────────────────────────────
// CKB stores Cell data as hex-encoded UTF-8 JSON
// e.g. "0x7b227469746c65223a22..." decodes to {"title":"..."}

export function parseCellData(hexData: string): Record<string, unknown> {
  try {
    // Remove 0x prefix
    const hex = hexData.startsWith("0x") ? hexData.slice(2) : hexData

    if (!hex || hex === "") {
      throw new Error("Cell data is empty")
    }

    // Hex → bytes → UTF-8 string
    const bytes = Buffer.from(hex, "hex")
    const json = bytes.toString("utf8")

    return JSON.parse(json)
  } catch (err) {
    throw new Error(`Failed to parse Cell data: ${err}`)
  }
}

// ── Verify a contest transaction ───────────────────────────────────────────────
// Fetches the TX, parses output[0]'s data, and checks it matches
// what the frontend claimed

export async function verifyContestTransaction(
  txHash: string,
  claimed: {
    title: string
    creatorAddress: string
    reward: number
  }
): Promise<void> {
  const tx = await fetchCkbTransaction(txHash)

  // Contest data is stored in the first output's data field
  const outputsData: string[] = tx.outputs_data
  if (!outputsData || outputsData.length === 0) {
    throw new Error("Transaction has no Cell data")
  }

  const cellData = parseCellData(outputsData[0])

  // Verify the key fields match what the frontend claimed
  if (cellData.title !== claimed.title) {
    throw new Error(
      `Title mismatch: on-chain="${cellData.title}" claimed="${claimed.title}"`
    )
  }

  const onChainAddress = (cellData.creator ||
    cellData.creatorAddress ||
    cellData.creator_address) as string
  if (onChainAddress !== claimed.creatorAddress) {
    throw new Error(
      `Creator address mismatch: on-chain="${onChainAddress}" claimed="${claimed.creatorAddress}"`
    )
  }

  // Reward comparison — allow small floating point tolerance
  const onChainReward = Number(cellData.reward)
  if (Math.abs(onChainReward - claimed.reward) > 0.001) {
    throw new Error(
      `Reward mismatch: on-chain="${cellData.reward}" claimed="${claimed.reward}"`
    )
  }
}

// ── Verify an entry transaction ────────────────────────────────────────────────

export async function verifyEntryTransaction(
  txHash: string,
  claimed: {
    contestId: string
    creatorAddress: string
  }
): Promise<void> {
  const tx = await fetchCkbTransaction(txHash)

  const outputsData: string[] = tx.outputs_data

  if (!outputsData || outputsData.length === 0) {
    throw new Error("Transaction has no Cell data")
  }

  const cellData = parseCellData(outputsData[0])

  const onChainContestId = (cellData.contestId || cellData.contest_id) as string
  if (onChainContestId !== claimed.contestId) {
    throw new Error(
      `Contest ID mismatch: on-chain="${onChainContestId}" claimed="${claimed.contestId}"`
    )
  }

  const onChainAddress = (cellData.creator ||
    cellData.creatorAddress ||
    cellData.creator_address) as string
  if (onChainAddress !== claimed.creatorAddress) {
    throw new Error(
      `Creator address mismatch: on-chain="${onChainAddress}" claimed="${claimed.creatorAddress}"`
    )
  }
}

// ── Verify a vote transaction ──────────────────────────────────────────────────
export async function verifyVoteTransaction(
  txHash: string,
  claimed: {
    entryId: string
    entryTxHash: string
    voterAddress: string
  }
): Promise<void> {
  const tx = await fetchCkbTransaction(txHash)

  const outputsData: string[] = tx.outputs_data
  if (!outputsData || outputsData.length === 0) {
    throw new Error("Transaction has no Cell data")
  }

  const cellData = parseCellData(outputsData[0])

  // Verify this is actually a vote Cell
  if (cellData.kind !== "vote") {
    throw new Error(`Not a vote Cell: kind="${cellData.kind}"`)
  }

  // Verify the entry outpoint matches
  const expectedOutpoint = `${claimed.entryTxHash}:0x0`
  if (cellData.entryOutpoint !== expectedOutpoint) {
    throw new Error(
      `Entry outpoint mismatch: on-chain="${cellData.entryOutpoint}" expected="${expectedOutpoint}"`
    )
  }

  // Verify the voter address matches
  const onChainVoter = (cellData.voter ||
    cellData.voterAddress ||
    cellData.voter_address) as string
  if (onChainVoter !== claimed.voterAddress) {
    throw new Error(
      `Voter address mismatch: on-chain="${onChainVoter}" claimed="${claimed.voterAddress}"`
    )
  }
}
