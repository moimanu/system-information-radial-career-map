import json

def processar_disciplinas():
    # 1. Carregar o arquivo de mapeamento de eixos
    with open('../../src/data/eixos-formacao.json', 'r', encoding='utf-8') as f:
        eixos_data = json.load(f)[0] # Primeiro elemento da lista
        
    # Inverter o dicionário para mapear do NOME DO EIXO para a CHAVE
    # Exemplo: "Formação Matemática" -> "mat"
    nome_para_chave = {nome.strip().lower(): chave for chave, nome in eixos_data.items()}

    # 2. Mapeamento manual com base na tabela da matriz curricular
    # Mapeia diretamente o código ou nome da disciplina para a sigla do eixo
    mapeamento_manual = {
        # 1º Período
        "OBBGSIN.085": "comp", # Introdução à Programação
        "OBBGSIN.044": "pso",  # Ética e Legislação
        "OBBGSIN.001": "ti",   # Introdução a Sistemas de Informação
        "OBBGSIN.011": "adm",  # Princípios da Administração I
        "OBBGSIN.007": "cpl",  # Português Instrumental I
        "OBBGSIN.101": "mat",  # Pré-Cálculo

        # 2º Período
        "OBBGSIN.009": "comp", # Algoritmos e Estrutura de Dados I
        "OBBGSIN.012": "mat",  # Cálculo Diferencial e Integral
        "OBBGSIN.003": "cpl",  # Inglês Instrumental I
        "OBBGSIN.002": "pso",  # Métodos e Técnicas de Pesquisa
        "OBBGSIN.010": "comp", # Programação Orientada a Objetos I

        # 3º Período
        "OBBGSIN.013": "comp", # Sistemas Digitais e Circuitos Combinacionais
        "OBBGSIN.015": "comp", # Algoritmos e Estrutura de Dados II
        "OBBGSIN.016": "ti",   # Banco de Dados I
        "OBBGSIN.018": "adm",  # Contabilidade
        "OBBGSIN.024": "comp", # Arquitetura e Organização de Computadores

        # 4º Período
        "OBBGSIN.017": "ti",   # Engenharia de Software I
        "OBBGSIN.021": "mat",  # Álgebra Linear e Geometria Analítica
        "OBBGSIN.022": "comp", # Programação Orientada a Objetos II
        "OBBGSIN.020": "mat",  # Matemática Discreta
        "OBBGSIN.030": "comp", # Sistemas Operacionais
        "OBBGSIN.023": "ti",   # Programação Web

        # 5º Período
        "OBBGSIN.041": "ti",   # Engenharia de Software II
        "OBBGSIN.031": "mat",  # Probabilidade e Estatística
        "OBBGSIN.029": "ti",   # Redes de Computadores I

        # 6º Período
        "OBBGSIN.019": "adm",  # Governança e Gestão da Informação
        "OBBGSIN.038": "comp", # Projeto e Análise de Algoritmos
        "OBBGSIN.039": "comp", # Programação para Dispositivos Móveis
        "OBBGSIN.036": "ti",   # Sistemas de Apoio à Decisão
        "OBBGSIN.037": "comp", # Sistemas Distribuídos

        # 7º Período
        "OBBGSIN.026": "ti",   # Interação Humano-Computador
        "OBBGSIN.040": "adm",  # Gestão de Projetos
        "OBBGSIN.034": "comp", # Inteligência Artificial

        # 8º Período
        "OBBGSIN.091": "pso",  # TCC I
        "OBBGSIN.102": "adm",  # Empreendedorismo
        "OBBGSIN.103": "ti",   # Qualidade de Software
        "OBBGSIN.092": "pso",  # TCC II

        # Disciplinas Optativas
        "OBBGSIN.035": "adm",  # Administração Financeira I
        "OBBGSIN.057": "adm",  # Avaliação de Empresas
        "OBBGSIN.033": "ti",   # Banco de Dados II
        "OBBGSIN.079": "mat",  # Cálculo Numérico
        "OBBGSIN.025": "adm",  # Comportamento Organizacional
        "OBBGSIN.070": "comp", # Computação Gráfica
        "OBBGSIN.081": "adm",  # Consultoria Empresarial
        "OBBGSIN.049": "ti",   # Gerência de Projetos de Software
        "OBBGSIN.055": "pso",  # Gestão Ambiental
        "OBBGSIN.054": "adm",  # Gestão da Inovação
        "OBBGSIN.094": "adm",  # Gestão de Recursos Humanos
        "OBBGSIN.060": "adm",  # Gestão de Serviços
        "OBBGSIN.059": "adm",  # Gestão do Conhecimento
        "OBBGSIN.006": "cpl",  # Inglês Instrumental II
        "OBBGSIN.083": "cpl",  # Inglês para Negócios I
        "OBBGSIN.084": "cpl",  # Inglês para Negócios II
        "OBBGSIN.075": "adm",  # Inteligência Competitiva
        "OBBGSIN.104": "cpl",  # Libras
        "OBBGSIN.028": "comp", # Linguagens Formais e Autômatos
        "OBBGSIN.050": "adm",  # Logística Reversa
        "OBBGSIN.068": "ti",   # Mineração de Dados
        "OBBGSIN.008": "cpl",  # Português Instrumental II
        "OBBGSIN.095": "comp", # Processamento de Imagens
        "OBBGSIN.073": "pso",  # Qualidade de Vida no Trabalho
        "OBBGSIN.032": "ti",   # Redes de Computadores II
        "OBBGSIN.074": "ti",   # Sistemas de Garantia de Qualidade
        "OBBGSIN.027": "comp", # Teoria dos Grafos
        "OBBGSIN.063": "ti",   # Tópicos Avançados em Banco de Dados
        "OBBGSIN.078": "ti",   # Tópicos Avançados em Engenharia de Software
        "OBBGSIN.096": "comp", # Tópicos Avançados em Inteligência Artificial
        "OBBGSIN.067": "ti",   # Tópicos Avançados em Tecnologias de Educação à Distância
        "OBBGSIN.097": "comp", # Tópicos em Desenvolvimento de Jogos Digitais
        "OBBGSIN.064": "comp", # Tópicos Especiais em Algoritmos
        "OBBGSIN.098": "comp", # Tópicos Especiais em Automação
        "OBBGSIN.065": "comp", # Tópicos Especiais em Desenvolvimento de Software
        "OBBGSIN.099": "comp", # Tópicos Especiais em Robótica
        "OBBGSIN.066": "ti",   # Tópicos Especiais em Sistemas Computacionais e Redes
    }

    # 3. Carregar o arquivo de disciplinas
    with open('../../src/data/disciplinas.json', 'r', encoding='utf-8') as f:
        disciplinas = json.load(f)

    # 4. Injetar a chave do eixo de formação em cada disciplina
    for disc in disciplinas:
        codigo = disc.get("codigo", "")
        eixo_existente = disc.get("eixoFormacao", "").strip().lower()

        # Tenta pegar pela chave existente no JSON se já houver um texto extenso
        if eixo_existente in nome_para_chave:
            disc["eixoFormacao"] = nome_para_chave[eixo_existente]
        # Se não, injeta usando o mapeamento do código do curso da tabela
        elif codigo in mapeamento_manual:
            disc["eixoFormacao"] = mapeamento_manual[codigo]

    # 5. Salvar as atualizações de volta no disciplinas.json
    with open('../../src/data/disciplinas.json', 'w', encoding='utf-8') as f:
        json.dump(disciplinas, f, ensure_ascii=False, indent=2)

    print("Chaves de eixos injetadas com sucesso em disciplinas.json!")

if __name__ == "__main__":
    processar_disciplinas()