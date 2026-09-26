import json
import re
import pdfplumber


def slugify(texto):
    """Gera um ID simples a partir do código ou nome da disciplina."""
    if not texto:
        return ""
    texto = texto.lower().strip()
    texto = re.sub(r"[^\w\s-]", "", texto)
    return re.sub(r"[\s_-]+", "-", texto)


def extrair_valor_campo(texto_completo, rotulo, delimitadores_seguintes=None):
    """Auxiliar para extrair o valor após um rótulo específico no texto."""
    if delimitadores_seguintes is None:
        delimitadores_seguintes = []

    padrao_delimitadores = "|".join([re.escape(d) for d in delimitadores_seguintes])
    if padrao_delimitadores:
        padrao = rf"{re.escape(rotulo)}\s*:\s*(.*?)(?=(?:{padrao_delimitadores})|(?:\d+º?\s*período)|(?:Código\s*:)|$)"
    else:
        # Trava de segurança extra para não consumir o início da próxima disciplina
        padrao = rf"{re.escape(rotulo)}\s*:\s*(.*?)(?=(?:\d+º?\s*período)|(?:Código\s*:)|$)"

    match = re.search(padrao, texto_completo, re.IGNORECASE | re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""


def parse_tabela_disciplina(linhas_tabela, periodo_atual):
    """Converte as linhas de uma tabela de disciplina individual para o dicionário no formato final."""
    texto_bloco = " ".join(
        [
            celula
            for linha in linhas_tabela
            for celula in linha
            if celula and isinstance(celula, str)
        ]
    )

    # 1. Código e Nome
    codigo = extrair_valor_campo(texto_bloco, "Código", ["Nome da disciplina"])
    nome = extrair_valor_campo(
        texto_bloco,
        "Nome da disciplina",
        ["Carga horária total", "Abordagem metodológica", "Natureza"],
    )

    # 2. Carga Horária (converte para inteiro)
    ch_total_str = extrair_valor_campo(
        texto_bloco,
        "Carga horária total",
        ["Abordagem metodológica", "Natureza", "CH teórica"],
    )
    ch_teorica_str = extrair_valor_campo(
        texto_bloco, "CH teórica", ["CH prática", "Ementa"]
    )
    ch_pratica_str = extrair_valor_campo(
        texto_bloco, "CH prática", ["Ementa", "Objetivo(s)", "Objetivos"]
    )

    ch_total = int(ch_total_str) if ch_total_str.isdigit() else 0
    ch_teorica = int(ch_teorica_str) if ch_teorica_str.isdigit() else 0
    ch_pratica = int(ch_pratica_str) if ch_pratica_str.isdigit() else 0

    # 3. Metodologia e Natureza
    abordagem = extrair_valor_campo(
        texto_bloco,
        "Abordagem metodológica",
        ["Natureza", "CH teórica", "CH prática"],
    )
    natureza = extrair_valor_campo(
        texto_bloco, "Natureza", ["CH teórica", "CH prática", "Ementa"]
    )

    # 4. Textos longos (Ementa, Objetivos, Bibliografias)
    ementa = extrair_valor_campo(
        texto_bloco, "Ementa", ["Objetivo(s)", "Objetivos", "Bibliografia básica"]
    )

    objetivos = extrair_valor_campo(
        texto_bloco, "Objetivo(s)", ["Bibliografia básica"]
    )
    if not objetivos:
        objetivos = extrair_valor_campo(
            texto_bloco, "Objetivos", ["Bibliografia básica"]
        )

    bib_basica = extrair_valor_campo(
        texto_bloco,
        "Bibliografia básica",
        ["Bibliografia complementar", "Bibliografia Complementar"],
    )
    
    # Adicionados delimitadores explícitos de fim para a bibliografia complementar
    bib_complementar = extrair_valor_campo(
        texto_bloco, "Bibliografia complementar", ["Código", "Nome da disciplina"]
    )
    if not bib_complementar:
        bib_complementar = extrair_valor_campo(
            texto_bloco, "Bibliografia Complementar", ["Código", "Nome da disciplina"]
        )

    # 5. Eixo de formação
    eixo = extrair_valor_campo(
        texto_bloco, "Eixo de formação", ["Eixo", "Natureza"]
    )
    if not eixo:
        eixo = extrair_valor_campo(texto_bloco, "Eixo", ["Natureza"])

    disciplina_id = slugify(codigo) if codigo else slugify(nome)

    return {
        "id": disciplina_id,
        "codigo": codigo,
        "nome": nome,
        "periodo": periodo_atual,
        "eixoFormacao": eixo,
        "natureza": natureza,
        "abordagemMetodologica": abordagem,
        "cargaHoraria": {
            "teorica": ch_teorica,
            "pratica": ch_pratica,
            "total": ch_total,
        },
        "dependencias": [],
        "ementa": ementa,
        "objetivos": objetivos,
        "bibliografiaBasica": bib_basica,
        "bibliografiaComplementar": bib_complementar,
        "camadasPorProfissao": {},
    }


def pdf_para_json_disciplinas(
    caminho_pdf,
    caminho_json,
    termo_parada="Bibliografia complementar",
):
    disciplinas = []
    periodo_atual = 1
    tabela_buffer = []

    with pdfplumber.open(caminho_pdf) as pdf:
        for pagina in pdf.pages:
            texto_pagina = pagina.extract_text() or ""
            match_periodo = re.search(r"(\d+)º?\s*período", texto_pagina, re.I)
            if match_periodo:
                periodo_atual = int(match_periodo.group(1))

            tabelas = pagina.extract_tables()

            for tabela in tabelas:
                for linha in tabela:
                    linha_limpa = [
                        (celula.replace("\n", " ").strip() if celula else "")
                        for celula in linha
                    ]

                    if not any(linha_limpa):
                        continue

                    linha_unida = " ".join(linha_limpa)

                    # Se encontrarmos o início de um novo bloco/disciplina no buffer sem ter limpado antes
                    eh_inicio_nova_disciplina = (
                        re.search(r"Código\s*:", linha_unida, re.I) and len(tabela_buffer) > 2
                    )

                    if eh_inicio_nova_disciplina:
                        objeto_disciplina = parse_tabela_disciplina(
                            tabela_buffer, periodo_atual
                        )
                        if objeto_disciplina["codigo"] or objeto_disciplina["nome"]:
                            disciplinas.append(objeto_disciplina)
                        tabela_buffer = []

                    match_periodo_linha = re.search(
                        r"(\d+)º?\s*período", linha_unida, re.I
                    )
                    if match_periodo_linha:
                        periodo_atual = int(match_periodo_linha.group(1))

                    tabela_buffer.append(linha_limpa)

                    if termo_parada.lower() in linha_unida.lower() and not eh_inicio_nova_disciplina:
                        objeto_disciplina = parse_tabela_disciplina(
                            tabela_buffer, periodo_atual
                        )
                        if objeto_disciplina["codigo"] or objeto_disciplina["nome"]:
                            disciplinas.append(objeto_disciplina)
                        tabela_buffer = []

    if tabela_buffer:
        objeto_disciplina = parse_tabela_disciplina(
            tabela_buffer, periodo_atual
        )
        if objeto_disciplina["codigo"] or objeto_disciplina["nome"]:
            disciplinas.append(objeto_disciplina)

    with open(caminho_json, "w", encoding="utf-8") as f:
        json.dump(disciplinas, f, ensure_ascii=False, indent=2)

    print(
        f"Sucesso! {len(disciplinas)} disciplina(s) exportada(s) para '{caminho_json}'."
    )


# --- Execução ---
arquivo_pdf = "../data/raw/EMENTARIO-BSI-2020.pdf"
arquivo_json = "../data/processed/disciplinas.json"

pdf_para_json_disciplinas(arquivo_pdf, arquivo_json)