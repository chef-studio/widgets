import { Currency, TradeType } from '@uniswap/sdk-core'
import { FeeOptions } from '@uniswap/v3-sdk'
import { SupportedChainId } from 'constants/chains'
import { nativeOnChain } from 'constants/tokens'
import { atom } from 'jotai'
import { atomWithImmer } from 'jotai/immer'
import { GetQuoteArgs, InterfaceTrade, QuoteState } from 'state/routing/types'

import { SettingsEventHandlers } from './settings'
export type {
  OnRouterPreferenceChange,
  OnSettingsReset,
  OnSlippageChange,
  OnTransactionDeadlineChange,
} from './settings'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export interface Swap {
  type: TradeType
  amount: string
  [Field.INPUT]?: Currency
  [Field.OUTPUT]?: Currency
}

const initialSwap: Swap = {
  type: TradeType.EXACT_INPUT,
  amount: '',
  [Field.INPUT]: nativeOnChain(SupportedChainId.MAINNET),
}

export const controlledAtom = atom<Swap | undefined>(undefined)
export const stateAtom = atomWithImmer(initialSwap)
export const swapAtom = atom((get) => {
  const controlled = get(controlledAtom)
  return controlled ? controlled : get(stateAtom)
}, stateAtom.write)

// If set to a transaction hash, that transaction will display in a status dialog.
export const displayTxHashAtom = atom<string | undefined>(undefined)

export const feeOptionsAtom = atom<FeeOptions | undefined>(undefined)

/** An integration hook called when the user selects a new token. */
export type OnTokenChange = (field: Field, token: Currency) => void

/**
 * An integration hook called when the user enters a new amount.
 * If the amount changed from the user clicking Max, origin will be set to 'max'.
 */
export type OnAmountChange = (field: Field, amount: string, origin?: 'max') => void

/** An integration hook called when the user switches the tokens. */
export type OnSwitchTokens = () => void

/**
 * An integration hook called when the user clicks the token selector.
 * If the hook resolve to false or rejects, the token selector will not open.
 */
export type OnTokenSelectorClick = (field: Field) => void | boolean | Promise<boolean>

interface InputEventHandlers {
  onTokenChange?: OnTokenChange
  onAmountChange?: OnAmountChange
  onSwitchTokens?: OnSwitchTokens
  onTokenSelectorClick?: OnTokenSelectorClick
}

/** An integration hook called when the user approves a token, either through allowance or permit. */
export type OnSwapApprove = () => void

/** An integration hook called when a new quote is fetched. */
export type OnSwapQuote = (
  event: {
    startTimestamp: number
    endTimestamp: number
    args: Omit<GetQuoteArgs, 'provider' | 'onQuote'>
    state?: QuoteState
  },
  error?: unknown
) => void

/** An integration hook called when the user receives an initial quote for a set of inputs. */
export type OnInitialSwapQuote = (trade: InterfaceTrade) => void

/** An integration hook called when the user acks a quote's price update. */
export type OnSwapPriceUpdateAck = (stale: InterfaceTrade, update: InterfaceTrade) => void

/** An integration hook called when the user expands a swap's details. */
export type OnExpandSwapDetails = () => void

/**
 * An integration hook called when the user clicks 'Review swap'.
 * If the hook resolves to false or rejects, the review dialog will not open.
 */
export type OnReviewSwapClick = () => void | boolean | Promise<boolean>

/** An integration hook called when the user confirms a swap, but before it is submitted. */
export type OnSubmitSwapClick = (trade: InterfaceTrade) => void

export interface SwapEventHandlers extends SettingsEventHandlers, InputEventHandlers {
  onSwapApprove?: OnSwapApprove
  onSwapQuote?: OnSwapQuote
  onInitialSwapQuote?: OnInitialSwapQuote
  onSwapPriceUpdateAck?: OnSwapPriceUpdateAck
  onExpandSwapDetails?: OnExpandSwapDetails
  onReviewSwapClick?: OnReviewSwapClick
  onSubmitSwapClick?: OnSubmitSwapClick
}

export const swapEventHandlersAtom = atom<SwapEventHandlers>({})

export const swapRouterUrlAtom = atom<string | undefined>(undefined)
