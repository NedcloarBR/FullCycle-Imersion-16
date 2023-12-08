package main

import (
	"encoding/csv"
	"fmt"
	"os"
	"sort"
	"strconv"
)

// Struct para representar uma entidade no arquivo CSV
type Entity struct {
	Nome      string
	Idade     int
	Pontuacao int
}

// Função principal
func main() {
	// Verificar se os argumentos de linha de comando foram fornecidos corretamente
	if len(os.Args) != 3 {
		fmt.Println("Uso: go run main.go arquivo-origem.csv arquivo-destino.csv")
		return
	}

	// Obter os nomes dos arquivos de entrada e saída
	arquivoOrigem := os.Args[1]
	arquivoDestino := os.Args[2]

	// Ler os dados do arquivo de origem
	dados, err := lerArquivo(arquivoOrigem)
	if err != nil {
		fmt.Println("Erro ao ler o arquivo de origem:", err)
		return
	}

	// Ordenar os dados por nome e salvar no arquivo de destino
	err = ordenarPorNome(dados)
	if err != nil {
		fmt.Println("Erro ao ordenar por nome:", err)
		return
	}
	err = salvarArquivo(arquivoDestino, dados)
	if err != nil {
		fmt.Println("Erro ao salvar o arquivo de destino:", err)
		return
	}

	// Ordenar os dados por idade e salvar em um novo arquivo de destino
	err = ordenarPorIdade(dados)
	if err != nil {
		fmt.Println("Erro ao ordenar por idade:", err)
		return
	}
	novoArquivoDestino := "arquivo-destino-por-idade.csv"
	err = salvarArquivo(novoArquivoDestino, dados)
	if err != nil {
		fmt.Println("Erro ao salvar o novo arquivo de destino:", err)
		return
	}

	fmt.Println("Operação concluída com sucesso.")
}

// Função para ler dados do arquivo CSV
func lerArquivo(nomeArquivo string) ([]Entity, error) {
	arquivo, err := os.Open(nomeArquivo)
	if err != nil {
		return nil, err
	}
	defer arquivo.Close()

	leitorCSV := csv.NewReader(arquivo)
	linhas, err := leitorCSV.ReadAll()
	if err != nil {
		return nil, err
	}

	var dados []Entity
	for _, linha := range linhas {
		idade, _ := strconv.Atoi(linha[1])
		pontuacao, _ := strconv.Atoi(linha[2])
		entidade := Entity{
			Nome:      linha[0],
			Idade:     idade,
			Pontuacao: pontuacao,
		}
		dados = append(dados, entidade)
	}

	return dados, nil
}

// Função para ordenar dados por nome
func ordenarPorNome(dados []Entity) error {
	sort.Slice(dados, func(i, j int) bool {
		return dados[i].Nome < dados[j].Nome
	})
	return nil
}

// Função para ordenar dados por idade
func ordenarPorIdade(dados []Entity) error {
	sort.Slice(dados, func(i, j int) bool {
		return dados[i].Idade < dados[j].Idade
	})
	return nil
}

// Função para salvar dados no arquivo CSV
func salvarArquivo(nomeArquivo string, dados []Entity) error {
	arquivo, err := os.Create(nomeArquivo)
	if err != nil {
		return err
	}
	defer arquivo.Close()

	escritorCSV := csv.NewWriter(arquivo)
	defer escritorCSV.Flush()

	for _, entidade := range dados {
		linha := []string{entidade.Nome, strconv.Itoa(entidade.Idade), strconv.Itoa(entidade.Pontuacao)}
		err := escritorCSV.Write(linha)
		if err != nil {
			return err
		}
	}

	return nil
}
