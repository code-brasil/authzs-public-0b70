document.addEventListener('DOMContentLoaded', () => {
    const projectId = 'authzs';

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const response = await fetch(`http://localhost:8000/functions/${projectId}/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login', email, password })
            });
            const result = await response.json();
            if (result.success) {
                localStorage.setItem('token', result.token);
                window.location.href = 'authenticated.html';
            } else {
                alert(result.message);
            }
        });
    }

    // Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const response = await fetch(`http://localhost:8000/functions/${projectId}/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'signup', name, email, password })
            });
            const result = await response.json();
            if (result.success) {
                alert('Cadastro realizado com sucesso!');
                window.location.href = 'index.html';
            } else {
                alert(result.message);
            }
        });
    }

    // Logout Button
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }

    // Admin Panel
    const refreshUsersButton = document.getElementById('refreshUsers');
    if (refreshUsersButton) {
        refreshUsersButton.addEventListener('click', loadUsers);
        loadUsers();
        loadStats();
    }

    async function loadUsers() {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/functions/${projectId}/admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_users', token })
        });
        const result = await response.json();
        if (result.success) {
            const usersTable = document.getElementById('usersTable');
            usersTable.innerHTML = '';
            result.users.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="border px-4 py-2">${user.id}</td>
                    <td class="border px-4 py-2">${user.name}</td>
                    <td class="border px-4 py-2">${user.email}</td>
                    <td class="border px-4 py-2">
                        <button class="edit-btn bg-yellow-500 text-white px-2 py-1 rounded" data-id="${user.id}">Editar</button>
                        <button class="delete-btn bg-red-500 text-white px-2 py-1 rounded" data-id="${user.id}">Deletar</button>
                    </td>
                `;
                usersTable.appendChild(tr);
            });
            // Add event listeners for edit and delete buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', editUser);
            });
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', deleteUser);
            });
        } else {
            alert(result.message);
        }
    }

    async function editUser(e) {
        const userId = e.target.getAttribute('data-id');
        const newName = prompt('Novo nome:');
        const newEmail = prompt('Novo email:');
        if (newName && newEmail) {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/functions/${projectId}/admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_user', token, id: userId, name: newName, email: newEmail })
            });
            const result = await response.json();
            if (result.success) {
                loadUsers();
                loadStats();
            } else {
                alert(result.message);
            }
        }
    }

    async function deleteUser(e) {
        const userId = e.target.getAttribute('data-id');
        if (confirm('Tem certeza que deseja deletar este usuário?')) {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/functions/${projectId}/admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete_user', token, id: userId })
            });
            const result = await response.json();
            if (result.success) {
                loadUsers();
                loadStats();
            } else {
                alert(result.message);
            }
        }
    }

    async function loadStats() {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/functions/${projectId}/admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_stats', token })
        });
        const result = await response.json();
        if (result.success) {
            document.getElementById('userCount').innerText = `Quantidade de Usuários: ${result.userCount}`;
            document.getElementById('onlineUsers').innerText = `Usuários online nos últimos 5 minutos: ${result.onlineUsers}`;
        } else {
            alert(result.message);
        }
    }
});