import Header from "../../components/header";
import HistoryTable from "../../components/historyTable";

export default function History() {
  return (
    <div>
      <Header />
      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Cross-chain bridge transaction history</h1>
        <HistoryTable />
      </div>
    </div>
  );
}