import { useEffect, useState } from "react";

export default function useDocument(service, id) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);

      const data = await service.getById(id);

      setDocument(data);

      setLoading(false);
    }

    load();
  }, [id, service]);

  return {
    document,
    loading,
  };
}