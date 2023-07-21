import express, { Request, Response } from "express";
import { SearchResult } from "./types";

const app = express();
const port = 3001;

//Подключили файл с пользователями
const usersData: SearchResult[] = require("./users.json");

app.use(express.json());

//Получение пользователей
app.post("/api/users", (req: Request, res: Response) => {
  const { email, number }: { email: string; number: string } = req.body;
  let searchResults: SearchResult[] = usersData;

  if (email) {
    const searchEmail: string = email.toLowerCase();
    searchResults = searchResults.filter((user: SearchResult) =>
      user.email.toLowerCase().includes(searchEmail)
    );
  }

  if (number) {
    const searchNumber: string = number.replace(/-/g, "");
    searchResults = searchResults.filter(
      (user: SearchResult) => user.number === searchNumber
    );
  }

  // Имитация задержки обработки запроса в 5 секунд
  setTimeout(() => {
    res.json(searchResults);
  }, 5000);
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
