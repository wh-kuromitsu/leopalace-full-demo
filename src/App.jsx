import React, { useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import Proposal from "./pages/Proposal";
import Customers from "./pages/Customers";
import Properties from "./pages/Properties";
import ProposalHistory from "./pages/ProposalHistory";
import Templates from "./pages/Templates";
import SalesforceSync from "./pages/SalesforceSync";
import Notifications from "./pages/Notifications";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";
import RecipientView from "./pages/RecipientView";
import ReactionSystem from "./pages/ReactionSystem";
import CRM from "./pages/CRM";
import CallReception from "./pages/CallReception";
import MessageInbox from "./pages/MessageInbox";

export default function App() {
  const [current, setCurrent] = useState("dashboard");

  return (
    <div className="app-shell">
      <Sidebar current={current} setCurrent={setCurrent} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header current={current} setCurrent={setCurrent} />
        <main className="flex-1 min-h-0 overflow-y-auto">
          {current === "dashboard" && <Dashboard setCurrent={setCurrent} />}
          {current === "cases" && <Cases setCurrent={setCurrent} />}
          {current === "proposal" && <Proposal setCurrent={setCurrent} />}
          {current === "customers" && <Customers />}
          {current === "properties" && <Properties />}
          {current === "history" && <ProposalHistory />}
          {current === "templates" && <Templates />}
          {current === "salesforce" && <SalesforceSync />}
          {current === "notifications" && <Notifications />}
          {current === "logs" && <Logs />}
          {current === "settings" && <Settings />}
          {current === "recipient" && <RecipientView />}
          {current === "reaction" && <ReactionSystem />}
          {current === "crm" && <CRM setCurrent={setCurrent} />}
          {current === "call" && <CallReception setCurrent={setCurrent} />}
          {current === "inbox" && <MessageInbox />}
        </main>
      </div>
    </div>
  );
}
