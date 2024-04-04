// Elementos do formulário
const tarefaForm = document.getElementById('form-tarefa');
const tituloInput = document.getElementById('titulo');
const descricaoInput = document.getElementById('descricao');
const dataInput = document.getElementById('data');

// Elementos da lista de tarefas
const listaTarefas = document.getElementById('lista-tarefas-body');
const nullMessage = document.getElementById('null');

// Array para armazenar as tarefas
let lista = [];

// Parâmetros da API do Todoist
const apiKey = '2b51febb62673f810e1cf55bc4b064871b27d541';
const url = 'https://api.todoist.com/rest/v2/tasks';

function inicializarAplicativo() {
    carregarTarefasLocalStorage();
    tarefaForm.addEventListener('submit', cadastrarTarefa);
}

async function cadastrarTarefa(event) {
    event.preventDefault();

    const tarefa = obterDadosDoFormulario();
    if (!tarefa) return;

    lista.push(tarefa);
    await enviarTarefaParaAPI(tarefa);
    limparCamposDoFormulario();
    atualizarListaTarefas();
}

function obterDadosDoFormulario() {
    const titulo = tituloInput.value.trim();
    const descricao = descricaoInput.value.trim();
    const data = dataInput.value;

    if (!titulo || !descricao || !data) {
        alert('Por favor, preencha todos os campos.');
        return null;
    }

    return { titulo, descricao, data, status: 'pendente' };
}

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
        alert('Ocorreu um erro:', error);
    }
}

function limparCamposDoFormulario() {
    tituloInput.value = '';
    descricaoInput.value = '';
    dataInput.value = '';
}

function atualizarListaTarefas() {
    listaTarefas.innerHTML = '';
    lista.forEach(adicionarTarefaNaLista);
    exibirMensagemDeListaVazia();
}

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

function exibirMensagemDeListaVazia() {
    if (lista.length === 0) {
        nullMessage.style.display = 'block';
    } else {
        nullMessage.style.display = 'none';
    }
}

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

function salvarTarefasLocalStorage() {
    localStorage.setItem('lista', JSON.stringify(lista));
}

function carregarTarefasLocalStorage() {
    const savedlista = localStorage.getItem('lista');
    if (savedlista) {
        lista = JSON.parse(savedlista);
        atualizarListaTarefas();
    }
}

window.addEventListener('DOMContentLoaded', inicializarAplicativo);
