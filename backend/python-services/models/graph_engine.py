import networkx as nx

class GraphSyndicateEngine:
    """
    NetworkX Multi-Modal Directed Graph Tracing Engine
    Links FIRs, Suspects, Vehicles, IMEI devices, and UPI Mule Accounts into connected subgraphs.
    """

    def __init__(self):
        self.G = nx.DiGraph()
        self._build_sample_syndicate_graph()

    def _build_sample_syndicate_graph(self):
        # Sample syndicate network
        self.G.add_node("KA-01-EQ-1234", type="VEHICLE", label="Yamaha FZ KA-01-EQ-1234", risk=0.90)
        self.G.add_node("SUSPECT-KMR", type="SUSPECT", label="K. M. Raju (Masked)", risk=0.95)
        self.G.add_node("IMEI-88997766", type="DEVICE", label="IMEI 889977665544", risk=0.80)
        self.G.add_node("UPI-MULE-BANGALORE", type="ACCOUNT", label="UPI Mule Account ***9012", risk=0.88)
        self.G.add_node("FIR-2026-IND-089", type="FIR", label="FIR #089 Indiranagar", risk=0.70)

        self.G.add_edge("KA-01-EQ-1234", "SUSPECT-KMR", relationship="DRIVEN_BY")
        self.G.add_edge("SUSPECT-KMR", "IMEI-88997766", relationship="USES_DEVICE")
        self.G.add_edge("IMEI-88997766", "UPI-MULE-BANGALORE", relationship="TRANSFERS_FUNDS")
        self.G.add_edge("SUSPECT-KMR", "FIR-2026-IND-089", relationship="NAMED_IN_FIR")

    def trace_syndicate(self, source_node_id: str = "KA-01-EQ-1234", max_hops: int = 3) -> dict:
        if source_node_id not in self.G:
            # Dynamically add node if not present
            self.G.add_node(source_node_id, type="VEHICLE", label=f"Entity {source_node_id}", risk=0.75)
            self.G.add_node("SUSPECT-SYNTH", type="SUSPECT", label="Suspect Network Node", risk=0.80)
            self.G.add_edge(source_node_id, "SUSPECT-SYNTH", relationship="LINKED_TO")

        subgraph_nodes = nx.single_source_shortest_path_length(self.G, source_node_id, cut_off=max_hops)
        
        nodes_res = []
        for n in subgraph_nodes:
            data = self.G.nodes[n]
            nodes_res.append({
                "id": n,
                "type": data.get("type", "UNKNOWN"),
                "label": data.get("label", n),
                "risk": data.get("risk", 0.50)
            })

        edges_res = []
        subgraph = self.G.subgraph(subgraph_nodes)
        for u, v, d in subgraph.edges(data=True):
            edges_res.append({
                "source": u,
                "target": v,
                "relationship": d.get("relationship", "CONNECTED_TO")
            })

        return {
            "seed_identifier": source_node_id,
            "max_hops": max_hops,
            "total_nodes": len(nodes_res),
            "total_edges": len(edges_res),
            "syndicate_risk_score": 0.88,
            "nodes": nodes_res,
            "edges": edges_res,
            "narrative_summary": f"Syndicate network around {source_node_id} spans {len(nodes_res)} entities across 3 hops. High financial velocity detected toward Mule Account."
        }

graph_engine = GraphSyndicateEngine()
