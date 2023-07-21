import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useRef,
} from "react";
import InputMask from "react-input-mask";
import { SearchResult } from "../types";

const App: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSearch = async () => {
    // Валидация полей на клиентской стороне
    if (!email) {
      alert("Введите email");
      return;
    }

    setLoading(true);

    // Отмена предыдущего запроса, если он есть
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch("http://localhost:3001/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, number }),
        signal: abortController.signal, // Передача сигнала отмены
      });
      const data = await response.json();
      setSearchResults(data);
      setLoading(false);
    } catch (error) {
      if ((error as DOMException).name === "AbortError") {
        // Запрос был отменен, не нужно обрабатывать ошибку
        setLoading(false);
      } else {
        console.error("Ошибка при отправке запроса:", error);
        setLoading(false);
      }
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch();
  };

  useEffect(() => {
    // Очистка AbortController при размонтировании компонента
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  //Смотрим изменение поля почты
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  //Смотрим изменение поля номера
  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNumber(e.target.value);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </label>
        <br />
        <label>
          Number:
          <InputMask
            mask="99-99-99"
            value={number}
            onChange={handleNumberChange}
            placeholder="00-00-00"
          />
        </label>
        <br />
        <button type="submit">{loading ? "Загрузка..." : "Отправить"}</button>
      </form>

      {searchResults.length > 0 && (
        <div>
          <h2>Найденные данные:</h2>
          <ul>
            {searchResults.map((result, index) => (
              <li key={index}>
                Email: {result.email}, Номер: {result.number}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
