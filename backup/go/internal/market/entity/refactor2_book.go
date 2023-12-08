package entity

import (
	"container/heap"
	"sync"
)

type Book struct {
	Order         []*Order
	Transactions  []*Transaction
	OrdersChan    chan *Order
	OrdersChanOut chan *Order
	Wg            *sync.WaitGroup
}

func NewBook(orderChan chan *Order, orderChanOut chan *Order, wg *sync.WaitGroup) *Book {
	return &Book{
		Order:         []*Order{},
		Transactions:  []*Transaction{},
		OrdersChan:    orderChan,
		OrdersChanOut: orderChanOut,
		Wg:            wg,
	}
}

func (b *Book) Trade() {
	buyOrders := make(map[string]*OrderQueue)
	sellOrders := make(map[string]*OrderQueue)

	for order := range b.OrdersChan {
		asset := order.Asset.ID

		InitQueue := func(orderType string, orders map[string]*OrderQueue) {
			if orders[asset] == nil {
				orders[asset] = NewOrderQueue()
			}
			if orders[asset].Len() == 0 {
				heap.Init(orders[asset])
			}
			orders[asset].Push(order)
		}

		if order.OrderType == "BUY" {
			InitQueue(order.OrderType, buyOrders)
			Loop(b, order, buyOrders[asset], sellOrders[asset])
		} else if order.OrderType == "SELL" {
			InitQueue(order.OrderType, sellOrders)
			Loop(b, order, sellOrders[asset], buyOrders[asset])
		}
	}
}

func Loop(b *Book, order *Order, currentQueue, counterQueue *OrderQueue) {
	if counterQueue.Len() > 0 && counterQueue.Orders[0].Price <= order.Price {
		counterOrder := counterQueue.Pop().(*Order)
		if counterOrder.PendingShares > 0 {
			transaction := NewTransaction(counterOrder, order, order.Shares, counterOrder.Price)
			b.AddTransaction(transaction, b.Wg)
			counterOrder.Transactions = append(counterOrder.Transactions, transaction)
			order.Transactions = append(order.Transactions, transaction)
			b.OrdersChanOut <- counterOrder
			b.OrdersChanOut <- order
			if counterOrder.PendingShares > 0 {
				counterQueue.Push(counterOrder)
			}
		}
	}
}

func (b *Book) AddTransaction(transaction *Transaction, wg *sync.WaitGroup) {
	defer wg.Done()

	sellingShares := transaction.SellingOrder.PendingShares
	buyingShares := transaction.BuyingOrder.PendingShares

	minShares := sellingShares
	if buyingShares < minShares {
		minShares = buyingShares
	}

	transaction.UpdateBuyingInvestor(minShares)
	transaction.UpdateSellingInvestor(minShares)

	transaction.CalculateTotal(transaction.Shares, transaction.BuyingOrder.Price)

	transaction.CloseBuyOrderTransaction()
	transaction.CloseSellOrderTransaction()

	if transaction.SellingOrder.PendingShares == 0 {
		transaction.SellingOrder.Status = "CLOSED"
	}

	b.Transactions = append(b.Transactions, transaction)
}
