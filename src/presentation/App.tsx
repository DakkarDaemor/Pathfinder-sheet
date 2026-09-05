import { Route, Routes } from "react-router-dom";
import { ConfirmProvider } from "./components/ConfirmProvider";
import { Layout } from "./components/Layout";
import { CharacterListPage } from "./features/character-list/CharacterListPage";
import { CharacterSheetPage } from "./features/character-sheet/CharacterSheetPage";

export function App() {
  return (
    <ConfirmProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<CharacterListPage />} />
          <Route path="/characters/:id" element={<CharacterSheetPage />} />
        </Routes>
      </Layout>
    </ConfirmProvider>
  );
}
