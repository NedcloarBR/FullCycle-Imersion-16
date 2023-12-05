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
	buyOrders := NewOrderQueue()
	sellOrders := NewOrderQueue()

	heap.Init(buyOrders)
	heap.Init(sellOrders)
	for order := range b.OrdersChan {
		Loop(b, order, buyOrders, sellOrders)
	}
}

func Loop(b *Book, order *Order, buy, sell *OrderQueue) {
	var operation bool
	var orderQueue *OrderQueue
	orderType := order.OrderType

	if orderType == "BUY" {
		buy.Push(order)
		operation = buy.Len() > 0 && buy.Orders[0].Price <= order.Price
		orderQueue = buy
	} else if orderType == "SELL" {
		sell.Push(order)
		operation = sell.Len() > 0 && sell.Orders[0].Price >= order.Price
		orderQueue = sell
	}

	if operation {
		currentOrder := orderQueue.Pop().(*Order)
		if currentOrder.PendingShares > 0 {
			transaction := NewTransaction(currentOrder, order, order.Shares, currentOrder.Price)
			b.AddTransaction(transaction, b.Wg)
			currentOrder.Transactions = append(currentOrder.Transactions, transaction)
			order.Transactions = append(order.Transactions, transaction)
			b.OrdersChanOut <- currentOrder
			b.OrdersChanOut <- order
			if currentOrder.PendingShares > 0 {
				orderQueue.Push(currentOrder)
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
