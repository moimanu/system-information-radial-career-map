import json
from pathlib import Path

# Mapeamento Centralizado de Pré-requisitos Diretos (Código -> Lista de Códigos dos Pré-requisitos)
DEPENDENCIAS_MAP = {
    # =========================================================================
    # 1º PERÍODO (Sem pré-requisitos)
    # =========================================================================
    "OBBGSIN.085": [],  # Introdução à Programação
    "OBBGSIN.044": [],  # Ética e Legislação
    "OBBGSIN.001": [],  # Introdução a Sistemas de Informação
    "OBBGSIN.011": [],  # Princípios da Administração I
    "OBBGSIN.007": [],  # Português Instrumental I
    "OBBGSIN.101": [],  # Pré-Cálculo

    # =========================================================================
    # 2º PERÍODO
    # =========================================================================
    "OBBGSIN.009": ["OBBGSIN.085"],  # Algoritmos e Estrutura de Dados I <- Intro à Programação
    "OBBGSIN.012": ["OBBGSIN.101"],  # Cálculo Diferencial e Integral <- Pré-Cálculo
    "OBBGSIN.003": [],              # Inglês Instrumental I
    "OBBGSIN.002": [],              # Métodos e Técnicas de Pesquisa
    "OBBGSIN.010": ["OBBGSIN.085"],  # Programação Orientada a Objetos I <- Intro à Programação

    # =========================================================================
    # 3º PERÍODO
    # =========================================================================
    "OBBGSIN.013": [],              # Sistemas Digitais e Circuitos Combinacionais
    "OBBGSIN.015": ["OBBGSIN.009"],  # Algoritmos e Estrutura de Dados II <- AED I
    "OBBGSIN.016": ["OBBGSIN.085"],  # Banco de Dados I <- Intro à Programação
    "OBBGSIN.018": [],              # Contabilidade
    "OBBGSIN.024": ["OBBGSIN.013"],  # Arq. e Org. de Computadores <- Sistemas Digitais

    # =========================================================================
    # 4º PERÍODO
    # =========================================================================
    "OBBGSIN.017": ["OBBGSIN.085"],  # Engenharia de Software I <- Intro à Programação
    "OBBGSIN.021": ["OBBGSIN.101"],  # Álgebra Linear e Geometria Analítica <- Pré-Cálculo
    "OBBGSIN.022": ["OBBGSIN.010"],  # Programação Orientada a Objetos II <- POO I
    "OBBGSIN.020": ["OBBGSIN.101"],  # Matemática Discreta <- Pré-Cálculo
    "OBBGSIN.030": ["OBBGSIN.024"],  # Sistemas Operacionais <- Arq. e Org. de Computadores
    "OBBGSIN.023": ["OBBGSIN.085"],  # Programação Web <- Intro à Programação

    # =========================================================================
    # 5º PERÍODO
    # =========================================================================
    "OBBGSIN.041": ["OBBGSIN.017"],  # Engenharia de Software II <- Eng. de Software I
    "OBBGSIN.031": ["OBBGSIN.012"],  # Probabilidade e Estatística <- Cálculo Diferencial e Integral
    "OBBGSIN.029": ["OBBGSIN.030"],  # Redes de Computadores I <- Sistemas Operacionais

    # =========================================================================
    # 6º PERÍODO
    # =========================================================================
    "OBBGSIN.019": ["OBBGSIN.001"],  # Governança e Gestão da Informação <- Intro a Sistemas de Informação
    "OBBGSIN.038": ["OBBGSIN.015"],  # Projeto e Análise de Algoritmos <- AED II
    "OBBGSIN.039": ["OBBGSIN.010", "OBBGSIN.023"],  # Prog. Dispositivos Móveis <- POO I, Prog Web
    "OBBGSIN.036": ["OBBGSIN.016"],  # Sistemas de Apoio à Decisão <- Banco de Dados I
    "OBBGSIN.037": ["OBBGSIN.029", "OBBGSIN.030"],  # Sistemas Distribuídos <- Redes I, SO

    # =========================================================================
    # 7º PERÍODO
    # =========================================================================
    "OBBGSIN.026": ["OBBGSIN.017"],  # Interação Humano Computador <- Eng. de Software I
    "OBBGSIN.040": ["OBBGSIN.011"],  # Gestão de Projetos <- Princípios da Administração I
    "OBBGSIN.034": ["OBBGSIN.009", "OBBGSIN.031"],  # Inteligência Artificial <- AED I, Prob. e Est.

    # =========================================================================
    # 8º PERÍODO
    # =========================================================================
    "OBBGSIN.091": ["OBBGSIN.002"],  # TCC I <- Métodos e Técnicas de Pesquisa
    "OBBGSIN.102": ["OBBGSIN.011"],  # Empreendedorismo <- Princípios da Administração I
    "OBBGSIN.103": ["OBBGSIN.017"],  # Qualidade de Software <- Eng. de Software I
    "OBBGSIN.092": ["OBBGSIN.091"],  # TCC II <- TCC I

    # =========================================================================
    # DISCIPLINAS OPTATIVAS
    # =========================================================================
    "OBBGSIN.035": ["OBBGSIN.018"],  # Administração Financeira I <- Contabilidade
    "OBBGSIN.057": ["OBBGSIN.018"],  # Avaliação de Empresas <- Contabilidade
    "OBBGSIN.033": ["OBBGSIN.016"],  # Banco de Dados II <- Banco de Dados I
    "OBBGSIN.079": ["OBBGSIN.012", "OBBGSIN.021"],  # Cálculo Numérico <- Cálculo, Álgebra Linear
    "OBBGSIN.025": ["OBBGSIN.011"],  # Comportamento Organizacional <- Princípios da Administração I
    "OBBGSIN.070": ["OBBGSIN.009", "OBBGSIN.021"],  # Computação Gráfica <- AED I, Álgebra Linear
    "OBBGSIN.081": ["OBBGSIN.011"],  # Consultoria Empresarial <- Princípios da Administração I
    "OBBGSIN.049": ["OBBGSIN.017"],  # Gerência de Projetos de Software <- Eng. de Software I
    "OBBGSIN.055": [],              # Gestão Ambiental
    "OBBGSIN.054": ["OBBGSIN.011"],  # Gestão da Inovação <- Princípios da Administração I
    "OBBGSIN.094": ["OBBGSIN.011"],  # Gestão de Recursos Humanos <- Princípios da Administração I
    "OBBGSIN.060": ["OBBGSIN.011"],  # Gestão de Serviços <- Princípios da Administração I
    "OBBGSIN.059": ["OBBGSIN.001"],  # Gestão do Conhecimento <- Intro a Sistemas de Informação
    "OBBGSIN.006": ["OBBGSIN.003"],  # Inglês Instrumental II <- Inglês Instrumental I
    "OBBGSIN.083": ["OBBGSIN.003"],  # Inglês para Negócios I <- Inglês Instrumental I
    "OBBGSIN.084": ["OBBGSIN.083"],  # Inglês para Negócios II <- Inglês para Negócios I
    "OBBGSIN.075": ["OBBGSIN.001"],  # Inteligência Competitiva <- Intro a Sistemas de Informação
    "OBBGSIN.104": [],              # Libras
    "OBBGSIN.028": ["OBBGSIN.020"],  # Linguagens Formais e Autômatos <- Matemática Discreta
    "OBBGSIN.050": ["OBBGSIN.011"],  # Logística Reversa <- Princípios da Administração I
    "OBBGSIN.068": ["OBBGSIN.016", "OBBGSIN.031"],  # Mineração de Dados <- Banco de Dados I, Prob. e Est.
    "OBBGSIN.008": ["OBBGSIN.007"],  # Português Instrumental II <- Português Instrumental I
    "OBBGSIN.095": ["OBBGSIN.009", "OBBGSIN.021"],  # Processamento de Imagens <- AED I, Álgebra Linear
    "OBBGSIN.073": [],              # Qualidade de Vida no Trabalho
    "OBBGSIN.032": ["OBBGSIN.029"],  # Redes de Computadores II <- Redes de Computadores I
    "OBBGSIN.074": ["OBBGSIN.017"],  # Sistemas de Garantia de Qualidade <- Eng. de Software I
    "OBBGSIN.027": ["OBBGSIN.009"],  # Teoria dos Grafos <- AED I
    "OBBGSIN.063": ["OBBGSIN.016"],  # Tópicos Avançados em Banco de Dados <- Banco de Dados I
    "OBBGSIN.078": ["OBBGSIN.017"],  # Tópicos Avançados em Engenharia de Software <- Eng. de Software I
    "OBBGSIN.096": ["OBBGSIN.034"],  # Tópicos Avançados em Inteligência Artificial <- Inteligência Artificial
    "OBBGSIN.067": [],              # Tópicos Avançados em Tecnologias de Educação à Distância
    "OBBGSIN.097": ["OBBGSIN.010"],  # Tópicos em Desenvolvimento de Jogos Digitais <- POO I
    "OBBGSIN.064": ["OBBGSIN.009"],  # Tópicos Especiais em Algoritmos <- AED I
    "OBBGSIN.098": ["OBBGSIN.013"],  # Tópicos Especiais em Automação <- Sistemas Digitais
    "OBBGSIN.065": ["OBBGSIN.010"],  # Tópicos Especiais em Desenvolvimento de Software <- POO I
    "OBBGSIN.099": ["OBBGSIN.009"],  # Tópicos Especiais em Robótica <- AED I
    "OBBGSIN.066": ["OBBGSIN.029"],  # Tópicos Especiais em Sistemas Computacionais e Redes <- Redes I
}

def atualizar_dependencias(caminho_entrada: str, caminho_saida: str = None) -> None:
    """Atualiza o campo de dependências no ficheiro JSON de disciplinas."""
    
    path_entrada = Path(caminho_entrada)
    path_saida = Path(caminho_saida) if caminho_saida else path_entrada

    if not path_entrada.exists():
        raise FileNotFoundError(f"Ficheiro de entrada não encontrado: {path_entrada}")

    # Carregar dados
    with open(path_entrada, 'r', encoding='utf-8') as f:
        disciplinas = json.load(f)

    codigos_existentes = {disc.get("codigo") for disc in disciplinas if "codigo" in disc}
    atualizados = 0

    # Atualizar dependências
    for disc in disciplinas:
        codigo = disc.get("codigo")
        if not codigo:
            continue
        
        novas_deps = DEPENDENCIAS_MAP.get(codigo, [])
        
        # Validação: Verifica se as dependências mapeadas realmente existem no JSON
        for dep in novas_deps:
            if dep not in codigos_existentes:
                print(f"⚠️  Aviso: O pré-requisito '{dep}' da disciplina '{codigo}' não existe na lista de disciplinas.")

        disc["dependencias"] = novas_deps
        atualizados += 1

    # Guardar alterações
    with open(path_saida, 'w', encoding='utf-8') as f:
        json.dump(disciplinas, f, ensure_ascii=False, indent=2)

    print(f"✅ Sucesso: {atualizados} disciplinas processadas e salvas em '{path_saida}'.")

if __name__ == '__main__':
    # Execução principal salvando no próprio ficheiro ou num novo caminho
    atualizar_dependencias('../data/processed/disciplinas.json')