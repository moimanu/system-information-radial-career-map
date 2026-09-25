import json

def gerar_arestas(caminho_arquivo_entrada, caminho_arquivo_saida):
    # Carrega o arquivo JSON das disciplinas
    with open(caminho_arquivo_entrada, 'r', encoding='utf-8') as f:
        disciplinas = json.load(f)

    # Cria um dicionário para mapear os códigos das disciplinas para seus IDs
    codigo_para_id = {disc['codigo']: disc['id'] for disc in disciplinas if 'codigo' in disc and 'id' in disc}

    arestas = []

    # Percorre cada disciplina para identificar dependências
    for disc in disciplinas:
        id_destino = disc.get('id')
        dependencias = disc.get('dependencias', [])

        for dep_codigo in dependencias:
            id_origem = codigo_para_id.get(dep_codigo)
            
            if id_origem and id_destino:
                arestas.append({
                    "origem": id_origem,
                    "destino": id_destino,
                    "tipo": "dependencia"
                })

    # Salva o arquivo JSON resultante
    with open(caminho_arquivo_saida, 'w', encoding='utf-8') as f:
        json.dump(arestas, f, ensure_ascii=False, indent=2)

    print(f"JSON de arestas criado com sucesso em: {caminho_arquivo_saida}")

# Execução do script
if __name__ == "__main__":
    gerar_arestas('src/data/disciplinas.json', 'src/data/arestas.json')