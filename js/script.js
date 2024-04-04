// Elementos do formulário
const tarefaForm = document.getElementById('form-tarefa');
const tituloInput = document.getElementById('titulo');
const descricaoInput = document.getElementById('descricao');
const categoriaInput = document.getElementById('categoria');
const dataInput = document.getElementById('data');

// Elementos da lista de tarefas
const listaTarefas = document.getElementById('lista-tarefas-body');
const nullMessage = document.getElementById('null');

// Array para armazenar as tarefas
let lista = [];

// Parâmetros da API do Todoist
const apiKey = 'API KEY';
const url = 'https://api.todoist.com/rest/v2/tasks';

// Função principal para inicializar o aplicativo
function inicializarAplicativo() {
    carregarTarefasLocalStorage();
    tarefaForm.addEventListener('submit', cadastrarTarefa);
}

// Função para cadastrar uma nova tarefa
async function cadastrarTarefa(event) {
    event.preventDefault();

    const tarefa = obterDadosDoFormulario();
    if (!tarefa) return;

    lista.push(tarefa);
    await enviarTarefaParaAPI(tarefa);
    limparCamposDoFormulario();
    atualizarListaTarefas();
}

// Função para obter os dados do formulário e criar um objeto de tarefa
function obterDadosDoFormulario() {
    const titulo = tituloInput.value.trim();
    const descricao = descricaoInput.value.trim();
    const categoria = categoriaInput.value.trim();
    const data = dataInput.value;

    if (!titulo || !descricao || !categoria || !data) {
        alert('Por favor, preencha todos os campos.');
        return null;
    }

    return { titulo, descricao, categoria, data, status: 'pendente' };
}

// Função para enviar uma tarefa para a API do Todoist
async function enviarTarefaParaAPI(tarefa) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                content: tarefa.titulo,
                description: tarefa.descricao,
                due_date: tarefa.data,
                priority: 1,
                labels: [tarefa.categoria]
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao cadastrar tarefa.');
        }

        const data = await response.json();
        tarefa.id = data.id;
        atualizarListaTarefas();
        salvarTarefasLocalStorage();
    } catch (error) {
        console.error('Ocorreu um erro:', error);
    }
}

// Função para limpar os campos do formulário após o cadastro da tarefa
function limparCamposDoFormulario() {
    tituloInput.value = '';
    descricaoInput.value = '';
    categoriaInput.value = '';
    dataInput.value = '';
}

// Função para atualizar a lista de tarefas na interface do usuário
function atualizarListaTarefas() {
    listaTarefas.innerHTML = '';
    lista.forEach(adicionarTarefaNaLista);
    exibirMensagemDeListaVazia();
}

// Função para adicionar uma tarefa à lista na interface do usuário
function adicionarTarefaNaLista(tarefa) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${tarefa.titulo}</td>
        <td>${tarefa.descricao}</td>
        <td>${tarefa.data}</td>
        <td>${tarefa.status}</td>
        <td>
            <button class="complete-button">Concluir</button>
            <button class="delete-button">Excluir</button>
        </td>
    `;

    const completeButton = row.querySelector('.complete-button');
    completeButton.addEventListener('click', () => concluirTarefa(tarefa));

    const deleteButton = row.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => excluirTarefa(tarefa));

    listaTarefas.appendChild(row);
}

// Função para exibir uma mensagem quando a lista de tarefas estiver vazia
function exibirMensagemDeListaVazia() {
    if (lista.length === 0) {
        nullMessage.style.display = 'block';
    } else {
        nullMessage.style.display = 'none';
    }
}

// Função para concluir uma tarefa
async function concluirTarefa(tarefa) {
    tarefa.status = 'concluída';

    try {
        const response = await fetch(`${url}/${tarefa.id}/close`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                id: tarefa.id
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao concluir tarefa.');
        }

        console.log('Tarefa concluída com sucesso no Todoist.');
        atualizarListaTarefas();
        salvarTarefasLocalStorage();
    } catch (error) {
        console.error('Ocorreu um erro:', error);
    }
}

// Função para excluir uma tarefa
async function excluirTarefa(tarefa) {
    lista = lista.filter((item) => item !== tarefa);

    try {
        const response = await fetch(`${url}/${tarefa.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir tarefa.');
        }

        console.log('Tarefa excluída com sucesso do Todoist.');
        atualizarListaTarefas();
        salvarTarefasLocalStorage();
    } catch (error) {
        console.error('Ocorreu um erro:', error);
    }
}

// Função para salvar as tarefas no Local Storage
function salvarTarefasLocalStorage() {
    localStorage.setItem('lista', JSON.stringify(lista));
}

// Função para carregar as tarefas do Local Storage ao carregar a página
function carregarTarefasLocalStorage() {
    const savedlista = localStorage.getItem('lista');
    if (savedlista) {
        lista = JSON.parse(savedlista);
        atualizarListaTarefas();
    }
}

// Chamada para inicializar o aplicativo quando a página é carregada
window.addEventListener('DOMContentLoaded', inicializarAplicativo);
