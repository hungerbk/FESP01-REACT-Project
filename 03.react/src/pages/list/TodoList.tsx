import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import RedArrowIcon from '@/assets/RedArrowIcon';
import MagnifyingGlass from '@/assets/MagnifyingGlass.svg';
import Trash from '@/assets/Trash.svg';

const TodoList = () => {
  const [todoList, setTodoList] = useState<TodoItem[]>([]);
  const [filteredList, setFilteredList] = useState<TodoItem[]>();
  const [filterKeyword, setFilterKeyword] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const getTodoList = async () => {
    try {
      const response = await axios.get<TodoListResponse>('http://localhost:33088/api/todolist');
      setTodoList(response.data.items);
      setFilteredList(response.data.items);
    } catch (err) {
      console.error(err);
    }
  };

  const filterTodoList = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setFilterKeyword(e.currentTarget.dataset.filter!);
  };

  const searchTodo = useCallback(
    (value: string) => {
      setSearchInput(value.split(' ').join('').toLowerCase());
    },
    [searchInput]
  );

  const patchTodoList = async (_id: number, done: boolean) => {
    try {
      const response = await axios.patch<TodoResponse>(
        `http://localhost:33088/api/todolist/${_id}`,
        {
          done: !done,
        }
      );
      return response.data;
    } catch (err) {
      console.error(err);
      return err;
    }
  };

  const toggleCheckbox = async (_id: number, done: boolean) => {
    const data = await patchTodoList(_id, done);
    if (data) {
      getTodoList();
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  useEffect(() => {
    getTodoList();
  }, []);

  useEffect(() => {
    const searchedList = todoList.filter((item) =>
      item.title.split(' ').join('').toLowerCase().includes(searchInput)
    );
    setFilteredList(searchedList);
  }, [searchInput]);

  useEffect(() => {
    switch (filterKeyword) {
      case 'all':
        setFilteredList(todoList);
        return;
      case 'done':
        setFilteredList(todoList.filter((todo) => todo.done));
        return;
      case 'uncompleted':
        setFilteredList(todoList.filter((todo) => !todo.done));
        return;
    }
  }, [filterKeyword, todoList]);

  return (
    <TodoListContainer>
      <FilterList>
        <li>
          <button type="button" className="searchButton" onClick={() => toggleSearch()}></button>
        </li>
        <li>
          <button onClick={(e) => filterTodoList(e)} type="button" data-filter="all">
            전체보기
          </button>
        </li>
        <li>
          <button onClick={(e) => filterTodoList(e)} type="button" data-filter="done">
            완료
          </button>
        </li>
        <li>
          <button onClick={(e) => filterTodoList(e)} type="button" data-filter="uncompleted">
            미완료
          </button>
        </li>
      </FilterList>
      <Searchform className={showSearch ? 'show' : ''}>
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          onChange={(e) => searchTodo(e.target.value)}
        />
      </Searchform>

      <TodoItemList>
        {filteredList?.map((todoItem) => (
          <TodoItem key={todoItem._id} className={todoItem.done ? 'done' : ''}>
            <div onClick={() => toggleCheckbox(todoItem._id, todoItem.done)}>
              <input type="checkbox" id="checkbox" className={todoItem.done ? 'done' : ''} />
              {todoItem.done ? <RedArrowIcon /> : null}
            </div>
            <Link to={`/info?_id=${todoItem._id}`}>{todoItem.title}</Link>
            <button type="button" className="deleteButton"></button>
          </TodoItem>
        ))}
      </TodoItemList>

      <RegistButton to={'/regist'}>할 일 추가하기</RegistButton>
    </TodoListContainer>
  );
};

export default TodoList;

const TodoListContainer = styled.div`
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 10px;
  height: 500px;
  background-color: #555555;
  border-radius: 10px;
`;

const FilterList = styled.ul`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  gap: 20px;
  list-style: none;

  button {
    display: block;
    width: 60px;
    height: 30px;
    padding: 5px;
    border: 1px solid white;
    border-radius: 10px;
    background-color: white;
    cursor: pointer;

    &.searchButton {
      width: 30px;
      padding: 5px;
      position: absolute;
      top: 10px;
      left: 15px;
      border-radius: 50%;
      background: white url(${MagnifyingGlass}) no-repeat 1px 1px;
      background-size: contain;
    }

    &.searchButton:hover {
      stroke: white;
    }

    &:hover {
      color: white;
      background-color: #555555;
    }
  }
`;

const Searchform = styled.form`
  display: none;
  &.show {
    display: block;
  }
  input {
    width: 100%;
    height: 30px;
    border: none;
    border-radius: 10px;
    text-indent: 15px;
  }
`;

const TodoItemList = styled.ul`
  margin: 0;
  padding: 0;
  overflow: auto;
  height: 68%;
  border-radius: 5px;
  margin-top: 5px;
`;

const TodoItem = styled.li`
  width: 100%;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 20px;
  text-align: center;
  background-color: white;
  border-radius: 10px;
  padding: 0 8px;
  margin-bottom: 15px;
  font-weight: 300;
  font-size: 18px;
  position: relative;

  input[type='checkbox'] {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid #555;
    appearance: none;
    cursor: pointer;
    flex-shrink: 0;
    display: flex;
  }
  a {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;

    text-overflow: ellipsis;
    text-decoration: none;
    color: black;
    display: flex;
    justify-content: center;
    background-color: blue;
  }

  &.done > a {
    text-decoration: line-through;
    color: white;
    text-decoration-color: #9c0000;
  }

  &.done {
    background-color: #555555;
    border: 1px solid white;
  }

  button.deleteButton {
    width: 30px;
    height: 30px;
    background: white ${Trash} no-repeat;
    cursor: pointer;
  }
`;

const RegistButton = styled(Link)`
  width: 100%;
  padding: 10px 0;
  border-radius: 10px;
  border: 0;
  font-size: 30px;
  font-weight: bold;
  text-decoration: none;
  text-align: center;

  color: #555555;
  background-color: #efefef;
  cursor: pointer;

  &:hover {
    background-color: #555555;
    color: white;
    border: 1px solid white;
  }

  &:focus {
    outline-style: none;
    box-shadow: none;
    border-color: transparent;
  }
`;
