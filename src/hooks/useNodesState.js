import { useState, useCallback } from 'react';

export function useNodesState() {
    const [nodes, setNodes] = useState([]);

    const addNode = useCallback(newNode => {
    if (!newNode || typeof newNode !== 'object' || typeof newNode.num !== 'number') {
        console.warn('Invalid nodeInfo received:', newNode);
        return;
    }

    setNodes(prev => {
        const exists = prev.some(n => n.num === newNode.num);
        return exists
        ? prev.map(n => n.num === newNode.num ? { ...n, ...newNode } : n)
        : [...prev, newNode];
    });
    }, []);



    return { nodes, addNode };
}
