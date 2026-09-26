Requisitos de UI:

- Lógica de cores: 60:30:10

- 60: branco
- 30: cinza muito claro
- 10: verde

- Para além disso, todas as outras cores a serem utilizadas devem ser de tons pastéis.

- O texto deve ser um cinza muito escuro.

- Não precisa de espaços para logotipos, títulos, descrições e coisas assim.

- Deve haver uma legenda para eixos de formação, onde eu consiga filtrar via checkbox no topo da tela em um componente flutuante.

Requisitos de UX:

- Devem existir 10 camadas radiais

- As camadas devem refletir o quão importante é uma disciplina para uma determinada profissão (quanto mais próximo do núcleo, mais importante.)

- Os vértices são as disciplinas

- Os vértices devem ser posicionados nas camadas

- O vértice de profissão fica no centro

- Ao clicar no vértice central, deve abrir um modal para escolher a profissao (via dropdown), o que deve alterar o grafo utilizando uma animação

- Os vértices precisam de labels que sejam o "nome"

- TODOS os labels devem ficar escondidos por padrão

- O hover em um vértice exibe o label (o label deve sobrepor o gráfico e os vértices para facilitar a visualização)

- Ao clicar na área de uma camada, devem aparecer os labels de todos os vértices daquela camada

- O hover em na área de uma camada deve exibir um label para indicar o nível da camada

- Nunca deve ser possível ver todos os labels de todos os vértices ao mesmo tempo

- Os vértices das disciplinas possuem conexões com outros vértices, sendo as arestas direcionadas (arcos) representadas por dependência 

- Ao clicar em um vértice, deve-se exibir todo o caminho desde a origem até as folhas (antes e depois do vértice), ao exibir esse subgrafo, deve-se reposicionar os vértices fora das camadas, em uma estrutura de árvore à parte (de cima para baixo) facilitando a exibição dos labels e do fluxo, escurecendo todos os outros vértices

- O clique fora do vértice deve retornar ao estado anterior

- TODA movimentação de vértices DEVE ser animada, para possibilitar o usuário de conseguir entender e acompanhar as alterações em tempo real

- Deve ser possível filtrar por eixos de formação (e tbm vértices que possuem valor vazio para esse atributo: "eixoFormacao": "",)

- Deve ser possível arrastar, dar zoom e retirar zoom

---

Requisitos técnicos:

-Essa aplicação deve consumir os jsons presentes em data/, sendo eles:

arestas.json
disciplinas.json
eixos-formacao.json
profissões.json