package main

import (
	"encoding/json"
	"fmt"
	"sync"

	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"

	"github.com/NedcloarBR/FullCycle-Immersion-16/go/internal/infra/kafka"
	"github.com/NedcloarBR/FullCycle-Immersion-16/go/internal/market/dto"
	"github.com/NedcloarBR/FullCycle-Immersion-16/go/internal/market/entity"
	"github.com/NedcloarBR/FullCycle-Immersion-16/go/internal/market/transformer"
)

func main() {
	ordersIn := make(chan *entity.Order)
	orderOut := make(chan *entity.Order)
	wg := &sync.WaitGroup{}
	defer wg.Wait()

	kafkaMsgChan := make(chan *ckafka.Message)
	configMap := &ckafka.ConfigMap{
		"bootstrap.servers": "host.docker.internal:9094",
		"group.id":          "myGroup",
		"auto.offset.reset": "latest",
	}
	producer := kafka.NewKafkaProducer(configMap)
	kafka := kafka.NewConsumer(configMap, []string{"input"})

	go kafka.Consume(kafkaMsgChan) // T2

	// Recebe do Canal do Kafka, joga no canal de input, processa e joga no canal de output, por fim publica no Kafka
	book := entity.NewBook(ordersIn, orderOut, wg)
	go book.Trade() // T3

	go func() {
		for msg := range kafkaMsgChan {
			wg.Add(1)
			fmt.Println(string(msg.Value))
			tradeInput := dto.TradeInput{}
			err := json.Unmarshal(msg.Value, &tradeInput)
			if err != nil {
				panic(err)
			}
			order := transformer.TransformInput(tradeInput)
			ordersIn <- order
		}
	}() // T4

	for res := range orderOut {
		output := transformer.TransformOutput(res)
		outputJson, err := json.MarshalIndent(output, "", "  ")
		fmt.Println(string(outputJson))
		if err != nil {
			fmt.Println(err)
		}
		producer.Publish(outputJson, []byte("orders"), "output")
	}
}
