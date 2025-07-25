import Header from "../../components/header";
import HistoryTable from "../../components/historyTable";

export default function History() {
  return (
    <div>
      <Header />
      <div className="mx-auto px-10 py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">Cross-chain bridge transaction history</h1>
        <HistoryTable />
      </div>
    </div>
  );
}