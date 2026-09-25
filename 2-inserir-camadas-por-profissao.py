import json

# 1. Lista determinística de profissões (índices 0 a 13)
PROFISSOES = [
    "engenheiro_de_software",                          # Índice 0
    "programador",                                     # Índice 1
    "web_designer",                                    # Índice 2
    "analista_de_teste",                               # Índice 3
    "analista_de_sistemas",                            # Índice 4
    "analista_de_requisitos",                          # Índice 5
    "analista_de_negocios",                            # Índice 6
    "administrador_de_bancos_de_dados",                # Índice 7
    "administrador_e_gerente_de_redes_de_computadores", # Índice 8
    "gerente_de_area_de_sistemas_de_informacao",       # Índice 9
    "empresario_na_area_de_sistemas_de_informacao",    # Índice 10
    "consultor_na_area_de_sistemas_de_informacao",     # Índice 11
    "pesquisador",                                     # Índice 12
    "gerente_de_projetos"                              # Índice 13
]

# 2. Matriz completa contendo todas as 52 disciplinas
# Escala invertida: 1 (Mais Forte / Proximidade Máxima) -> 10 (Mais Fraco / Proximidade Mínima)
MATRIZ_DISCIPLINAS = {
    # 1º Período
    "OBBGSIN.085": [ 1,  1,  5,  2,  2,  3,  4,  3,  5,  6,  6,  5,  3,  6], # Introdução à Programação
    "OBBGSIN.044": [ 8,  8,  8,  8,  7,  7,  6,  8,  7,  5,  4,  5,  6,  5], # Ética e Legislação
    "OBBGSIN.001": [ 3,  3,  4,  3,  2,  2,  2,  3,  3,  2,  3,  2,  3,  2], # Introdução a Sistemas de Informação
    "OBBGSIN.011": [ 9, 10, 10,  9,  7,  6,  3,  9,  7,  2,  1,  3,  8,  2], # Princípios da Administração I
    "OBBGSIN.007": [ 8,  8,  7,  6,  6,  5,  5,  8,  7,  4,  4,  4,  3,  4], # Português Instrumental I
    "OBBGSIN.101": [ 6,  6,  9,  7,  6,  8,  8,  5,  6,  8,  9,  8,  4,  8], # Pré-Cálculo

    # 2º Período
    "OBBGSIN.009": [ 1,  1,  5,  2,  2,  4,  6,  3,  6,  7,  8,  7,  3,  7], # Algoritmos e Estrutura de Dados I
    "OBBGSIN.012": [ 5,  5, 10,  7,  6,  9,  9,  6,  7,  9, 10,  9,  3,  9], # Cálculo Diferencial e Integral
    "OBBGSIN.003": [ 5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  3,  5], # Inglês Instrumental I
    "OBBGSIN.002": [ 8,  9,  9,  8,  7,  6,  6,  8,  8,  6,  6,  5,  1,  6], # Métodos e Técnicas de Pesquisa
    "OBBGSIN.010": [ 1,  1,  4,  2,  2,  4,  6,  4,  7,  7,  8,  6,  3,  7], # Programação Orientada a Objetos I

    # 3º Período
    "OBBGSIN.013": [ 5,  6, 10,  7,  7,  9, 10,  8,  4,  9, 10,  9,  4, 10], # Sistemas Digitais e Circuitos Combinacionais
    "OBBGSIN.016": [ 2,  2,  4,  3,  2,  3,  4,  1,  4,  5,  6,  4,  3,  5], # Banco de Dados I
    "OBBGSIN.018": [10, 10, 10, 10,  8,  7,  4,  9, 10,  4,  2,  4,  9,  4], # Contabilidade
    "OBBGSIN.024": [ 4,  5,  9,  6,  6,  8,  9,  5,  2,  8,  9,  8,  4,  9], # Arquitetura e Organização de Computadores

    # 4º Período
    "OBBGSIN.017": [ 1,  3,  6,  2,  1,  1,  2,  5,  7,  3,  4,  2,  4,  1], # Engenharia de Software I
    "OBBGSIN.022": [ 1,  1,  5,  2,  3,  5,  7,  5,  8,  8,  9,  7,  4,  8], # Programação Orientada a Objetos II
    "OBBGSIN.020": [ 4,  4,  9,  5,  6,  8,  9,  4,  6,  9, 10,  8,  2,  9], # Matemática Discreta
    "OBBGSIN.030": [ 3,  4,  8,  5,  5,  7,  8,  3,  1,  6,  8,  7,  4,  8], # Sistemas Operacionais
    "OBBGSIN.023": [ 2,  2,  1,  3,  3,  5,  6,  5,  8,  7,  6,  6,  5,  7], # Programação Web

    # 5º Período
    "OBBGSIN.041": [ 1,  3,  7,  3,  2,  2,  3,  6,  7,  4,  5,  3,  4,  2], # Engenharia de Software II
    "OBBGSIN.031": [ 6,  6, 10,  5,  6,  7,  4,  3,  7,  5,  6,  5,  2,  5], # Probabilidade e Estatística
    "OBBGSIN.029": [ 4,  5,  8,  5,  4,  7,  8,  4,  1,  6,  7,  6,  5,  7], # Redes de Computadores I

    # 6º Período
    "OBBGSIN.019": [ 8,  9, 10,  8,  6,  6,  3,  7,  4,  1,  2,  2,  7,  2], # Governança e Gestão da Informação
    "OBBGSIN.038": [ 2,  2,  7,  4,  4,  6,  8,  5,  7,  9,  9,  8,  1,  9], # Projeto e Análise de Algoritmos
    "OBBGSIN.039": [ 2,  2,  3,  4,  4,  5,  7,  7,  9,  8,  7,  7,  5,  8], # Programação para Dispositivos Móveis
    "OBBGSIN.036": [ 6,  7,  9,  7,  4,  5,  2,  3,  8,  2,  3,  2,  4,  3], # Sistemas de Apoio à Decisão
    "OBBGSIN.037": [ 2,  3,  8,  4,  3,  6,  7,  4,  2,  6,  8,  6,  3,  7], # Sistemas Distribuídos

    # 7º Período
    "OBBGSIN.026": [ 3,  4,  1,  3,  3,  2,  4,  7,  8,  6,  6,  5,  5,  6], # Interface Humano Computador
    "OBBGSIN.040": [ 6,  8,  9,  6,  5,  4,  3,  7,  5,  2,  3,  3,  6,  1], # Gestão de Projetos
    "OBBGSIN.034": [ 2,  3,  8,  4,  4,  6,  6,  5,  8,  7,  7,  5,  1,  7], # Inteligência Artificial

    # 8º Período e Optativas
    "OBBGSIN.091": [ 5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  1,  5], # TCC I
    "OBBGSIN.102": [ 8,  9,  8,  9,  7,  7,  4,  9,  7,  3,  1,  3,  8,  4], # Empreendedorismo
    "OBBGSIN.103": [ 2,  4,  6,  1,  3,  4,  5,  6,  7,  4,  6,  4,  4,  3], # Qualidade de Software
    "OBBGSIN.092": [ 5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  1,  5], # TCC II
    "OBBGSIN.035": [10, 10, 10, 10,  9,  8,  4,  9,  9,  3,  2,  3,  9,  4], # Administração Financeira I
    "OBBGSIN.057": [10, 10, 10, 10,  9,  8,  5, 10, 10,  4,  2,  2,  9,  6], # Avaliação de Empresas
    "OBBGSIN.033": [ 3,  4,  7,  5,  4,  6,  6,  1,  5,  7,  8,  6,  4,  7], # Banco de Dados II
    "OBBGSIN.079": [ 6,  6, 10,  8,  7,  9,  9,  7,  9,  9, 10,  9,  2,  9], # Cálculo Numérico
    "OBBGSIN.025": [ 8,  9,  9,  8,  7,  6,  5,  8,  6,  2,  3,  3,  8,  2], # Comportamento Organizacional
    "OBBGSIN.070": [ 4,  4,  3,  6,  6,  8,  9,  8,  9,  9,  8,  8,  3,  9], # Computação Gráfica
    "OBBGSIN.081": [ 9, 10, 10,  9,  7,  6,  4,  9,  8,  4,  3,  1,  8,  5], # Consultoria Empresarial
    "OBBGSIN.049": [ 5,  7,  8,  5,  4,  3,  3,  7,  6,  2,  4,  4,  6,  1], # Gerência de Projetos de Software
    "OBBGSIN.055": [10, 10, 10, 10,  9,  9,  8, 10,  9,  7,  6,  6,  7,  8], # Gestão Ambiental
    "OBBGSIN.054": [ 6,  7,  6,  8,  5,  5,  3,  8,  6,  2,  1,  2,  3,  3], # Gestão da Inovação
    "OBBGSIN.094": [ 9, 10, 10,  9,  8,  8,  7,  9,  7,  2,  3,  5,  9,  3], # Gestão de Recursos Humanos
    "OBBGSIN.060": [ 9, 10, 10,  9,  7,  7,  5,  8,  6,  2,  3,  3,  8,  4], # Gestão de Serviços
    "OBBGSIN.059": [ 8,  9,  9,  8,  6,  6,  4,  7,  7,  3,  4,  3,  5,  4], # Gestão do Conhecimento
    "OBBGSIN.006": [ 5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  5,  3,  5], # Inglês Instrumental II
    "OBBGSIN.083": [ 8,  9,  9,  9,  7,  6,  3,  9,  8,  4,  2,  2,  6,  4], # Inglês para Negócios I
    "OBBGSIN.084": [ 8,  9,  9,  9,  7,  6,  3,  9,  8,  4,  2,  2,  6,  4], # Inglês para Negócios II
    "OBBGSIN.075": [ 8,  9,  9,  8,  7,  6,  2,  7,  8,  2,  2,  1,  5,  4], # Inteligência Competitiva
    "OBBGSIN.104": [ 8,  8,  7,  8,  7,  6,  7,  9,  9,  7,  7,  6,  8,  7], # Libras
    "OBBGSIN.028": [ 4,  4, 10,  7,  6,  8,  9,  8,  9, 10, 10,  9,  2, 10], # Linguagens Formais e Autômatos
    "OBBGSIN.050": [10, 10, 10, 10,  9,  8,  6, 10, 10,  7,  6,  6,  8,  7], # Logística Reversa
    "OBBGSIN.068": [ 3,  4,  9,  5,  4,  6,  3,  2,  8,  5,  6,  4,  1,  6], # Mineração de Dados
    "OBBGSIN.008": [ 8,  8,  7,  6,  6,  5,  5,  8,  7,  4,  4,  4,  3,  4], # Português Instrumental II
    "OBBGSIN.095": [ 4,  5,  4,  7,  7,  8,  9,  8,  9, 10,  9,  9,  2,  9], # Processamento de Imagens
    "OBBGSIN.073": [ 9, 10, 10,  9,  9,  8,  7,  9,  8,  3,  4,  5,  9,  4], # Qualidade de Vida no Trabalho
    "OBBGSIN.032": [ 6,  7,  9,  7,  6,  8,  9,  6,  1,  7,  8,  7,  5,  8], # Redes de Computadores II
    "OBBGSIN.074": [ 7,  8,  9,  2,  5,  6,  5,  7,  7,  4,  5,  4,  7,  3], # Sistemas de Garantia de Qualidade
    "OBBGSIN.027": [ 3,  4,  9,  6,  5,  8,  9,  5,  4,  9, 10,  9,  1,  9], # Teoria dos Grafos
    "OBBGSIN.063": [ 4,  5,  8,  6,  4,  7,  6,  1,  6,  8,  9,  6,  3,  8], # Tópicos Avançados em Banco de Dados
    "OBBGSIN.078": [ 1,  4,  8,  3,  2,  2,  4,  7,  8,  5,  6,  4,  3,  2], # Tópicos Avançados em E.S.
    "OBBGSIN.096": [ 2,  3,  9,  5,  5,  7,  7,  6,  9,  8,  8,  6,  1,  8], # Tópicos Avançados em I.A.
    "OBBGSIN.067": [ 8,  9,  7,  8,  7,  6,  7,  9,  8,  7,  6,  6,  4,  7], # Tópicos Avançados em EaD
    "OBBGSIN.097": [ 3,  2,  4,  4,  5,  6,  8,  8,  9,  9,  7,  9,  4,  8], # Tópicos em Jogos Digitais
    "OBBGSIN.064": [ 2,  2,  8,  5,  5,  7,  9,  6,  8, 10, 10,  9,  1, 10], # Tópicos Especiais em Algoritmos
    "OBBGSIN.098": [ 5,  5,  9,  6,  6,  7,  8,  7,  4,  8,  7,  7,  3,  8], # Tópicos Especiais em Automação
    "OBBGSIN.065": [ 1,  2,  5,  3,  2,  3,  5,  6,  8,  6,  7,  5,  4,  4], # Tópicos Especiais em Dev. Software
    "OBBGSIN.099": [ 4,  5,  9,  7,  7,  8,  9,  8,  7,  9,  8,  9,  2,  9], # Tópicos Especiais em Robótica
    "OBBGSIN.066": [ 5,  6,  9,  6,  6,  8,  9,  5,  1,  8,  9,  8,  4,  8]  # Tópicos Especiais em Redes/SO
}

def injetar_camadas_por_profissao(dados_disciplinas):
    """
    Injeta o objeto 'camadasPorProfissao' em cada disciplina da lista JSON,
    mapeando as profissões com seus respectivos valores (escala: 1=forte, 10=fraco).
    """
    for disciplina in dados_disciplinas:
        codigo = disciplina.get("codigo")
        
        if codigo in MATRIZ_DISCIPLINAS:
            vetor_proximidade = MATRIZ_DISCIPLINAS[codigo]
            
            camadas = {
                profissao: str(vetor_proximidade[i])
                for i, profissao in enumerate(PROFISSOES)
            }
            
            disciplina["camadasPorProfissao"] = camadas

    return dados_disciplinas


if __name__ == "__main__":
    with open("src/data/disciplinas.json", "r", encoding="utf-8") as f:
        disciplinas_brutas = json.load(f)

    disciplinas_processadas = injetar_camadas_por_profissao(disciplinas_brutas)

    with open("src/data/disciplinas.json", "w", encoding="utf-8") as f:
        json.dump(disciplinas_processadas, f, indent=2, ensure_ascii=False)

    print(f"Sucesso! Processamento concluído para {len(disciplinas_processadas)} disciplinas na nova escala (1=forte, 10=fraco).")