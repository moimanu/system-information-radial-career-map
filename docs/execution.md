[← Voltar](../README.md)

# Guia de Execução

Instruções para inicialização da aplicação web em ambiente local e reprocessamento do pipeline de dados.

---

## Pré-requisitos
* Servidor HTTP simples (ex.: Python `http.server`, extensão Live Server do VS Code, ou Node `http-server`).
* Python 3.x (necessário apenas em caso de reprocessamento dos dados originais).

---

## Execução da Aplicação Web

1. Clone o repositório:
```bash
git clone https://github.com/moimanu/system-information-radial-career-map.git
```

2. Navegue até o diretório do projeto e inicie um servidor HTTP local:

```bash
python -m http.server 8000
```

3. Acesse a aplicação no navegador através do endereço:
`http://localhost:8000`

---

## Reprocessamento de Dados (Opcional)

Caso seja necessário re-extrair ou reprocessar as informações a partir dos arquivos PDF do PPC e Ementário localizados em `data/raw/`:

1. Instale as dependências Python necessárias:

```bash
pip install -r requirements.txt
```

2. Execute incrementalmente os scripts de transformação na ordem descrita abaixo:

```bash
cd scripts
python 1-extrair-disciplinas.py
python 2-inserir-camadas-por-profissao.py
python 3-inserir-eixos.py
python 4-inserir-dependencias.py
python 5-criar-arestas.py
```

Os arquivos JSON atualizados serão gerados no diretório `data/processed/`.