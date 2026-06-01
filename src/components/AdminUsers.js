import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { getUsers, deleteUser } from "../services/userService";
import "./AdminUsers.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmUserId, setConfirmUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query),
    );
    setFilteredUsers(filtered);
  };

  const handleDeleteClick = (id) => {
    setConfirmUserId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmUserId) return;

    try {
      setDeletingId(confirmUserId);
      await deleteUser(confirmUserId);
      setUsers(users.filter((u) => u.id !== confirmUserId));
    } catch (err) {
      alert("Ошибка удаления: " + err.message);
    } finally {
      setDeletingId(null);
      setShowConfirm(false);
      setConfirmUserId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setConfirmUserId(null);
  };

  const getRoleBadgeClass = (role) => {
    return role === 2 ? "badge--admin" : "badge--user";
  };

  const getRoleText = (role) => {
    return role === 2 ? "Админ" : "Пользователь";
  };

  if (loading) {
    return (
      <div className="admin-users">
        <div className="admin-users__loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-users">
        <div className="admin-users__error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="admin-users__header">
        <Link to="/admin" className="admin-users__back">
          <ArrowLeftIcon className="admin-users__back-icon" />
          Назад
        </Link>
        <h1>Управление пользователями</h1>
        <span className="admin-users__count">
          {filteredUsers.length} из {users.length}
        </span>
      </div>

      <div className="admin-users__search">
        <MagnifyingGlassIcon className="admin-users__search-icon" />
        <input
          type="text"
          placeholder="Поиск по имени или email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-users__search-input"
        />
      </div>

      <div className="admin-users__table-container">
        <table className="admin-users__table">
          <thead>
            <tr>
              <th>Пользователь</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Дата регистрации</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers?.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="admin-users__user">
                    <div className="admin-users__avatar">
                      <UserIcon className="admin-users__avatar-icon" />
                    </div>
                    <span>{user.username || "Без имени"}</span>
                  </div>
                </td>
                <td>
                  <div className="admin-users__email">
                    <EnvelopeIcon className="admin-users__email-icon" />
                    {user.email}
                  </div>
                </td>
                <td>
                  <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                    <ShieldCheckIcon className="badge__icon" />
                    {getRoleText(user.role)}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="admin-users__actions">
                    {user.role === 1 && (
                      <button
                        className="btn btn--outline btn--sm btn--danger"
                        onClick={() => handleDeleteClick(user.id)}
                        disabled={deletingId === user.id}
                        title="Удалить"
                      >
                        <TrashIcon className="btn__icon" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="admin-users__empty">
          <UserIcon className="admin-users__empty-icon" />
          <p>Пользователи не найдены</p>
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить этого пользователя?</p>
            <div className="modal__actions">
              <button className="btn btn--outline" onClick={handleCancelDelete}>
                Отмена
              </button>
              <button
                className="btn btn--primary btn--danger"
                onClick={handleConfirmDelete}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
