import { ChevronDown, ChevronRight, Database, Folder, Search } from "lucide-react";
import { useState } from "react";
import type { DatasetHierarchyNode } from "../../api/datasetsTypes";
import { useSelectedDataset } from "../../../../contexts/SelectedDatasetContext";
import { useDataHierarchy } from "../../hooks/datasets/useDataHierarchy";
import { DatasetPanelError } from "./DatasetPanelError";
import { DatasetPanelSkeleton } from "./DatasetPanelSkeleton";

function nodeMatchesQuery(node: DatasetHierarchyNode, query: string): boolean {
  const currentMatch = node.name.toLowerCase().includes(query);
  if (currentMatch) {
    return true;
  }
  if (!node.children) {
    return false;
  }
  return node.children.some((child) => nodeMatchesQuery(child, query));
}

type TreeNodeProps = {
  node: DatasetHierarchyNode;
  depth: number;
  expandedIds: Set<string>;
  toggleNode: (nodeId: string) => void;
  selectedDatasetId: string;
  setSelectedDatasetId: (datasetId: string) => void;
  searchQuery: string;
};

function TreeNode({
  node,
  depth,
  expandedIds,
  toggleNode,
  selectedDatasetId,
  setSelectedDatasetId,
  searchQuery,
}: TreeNodeProps) {
  const isExpanded = expandedIds.has(node.id);

  if (searchQuery && !nodeMatchesQuery(node, searchQuery)) {
    return null;
  }

  if (node.type === "dataset") {
    const isSelected = selectedDatasetId === node.id;
    return (
      <button
        type="button"
        onClick={() => {
          setSelectedDatasetId(node.id);
        }}
        className={[
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition",
          isSelected
            ? "bg-emerald-500/20 text-emerald-200"
            : "text-slate-300 hover:bg-slate-700/60 hover:text-slate-100",
        ].join(" ")}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        <Database className="h-4 w-4" />
        <span>{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => toggleNode(node.id)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-slate-200 hover:bg-slate-700/50"
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <Folder className="h-4 w-4 text-slate-400" />
        <span>{node.name}</span>
      </button>
      {isExpanded && node.children ? (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              toggleNode={toggleNode}
              selectedDatasetId={selectedDatasetId}
              setSelectedDatasetId={setSelectedDatasetId}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function DataSourcesNavigator() {
  const { data, isLoading, isError, error, refetch } = useDataHierarchy();
  const { selectedDatasetId, setSelectedDatasetId } = useSelectedDataset();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["sources", "archive", "datasets-folder", "train-folder"]));

  const searchableQuery = searchQuery.trim().toLowerCase();
  const hierarchy = data ?? [];

  function toggleNode(nodeId: string) {
    setExpandedIds((previous) => {
      const next = new Set(previous);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }

  if (isLoading) {
    return <DatasetPanelSkeleton titleWidthClass="w-32" heightClass="h-[640px]" />;
  }

  if (isError) {
    return (
      <DatasetPanelError
        message={error.message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-100">Data sources</h3>
      </div>

      <label className="mb-3 flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
        <Search className="h-4 w-4" />
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search"
          className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
        />
      </label>

      <div className="max-h-[620px] overflow-y-auto pr-1">
        {hierarchy.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            expandedIds={expandedIds}
            toggleNode={toggleNode}
            selectedDatasetId={selectedDatasetId}
            setSelectedDatasetId={setSelectedDatasetId}
            searchQuery={searchableQuery}
          />
        ))}
      </div>
    </section>
  );
}
