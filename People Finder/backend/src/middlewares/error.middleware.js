export function errorHandler(err, _req, res, next) {
  if (err?.message === "Solo se permiten imagenes") {
    return res.status(400).json({ error: err.message });
  }

  if (err?.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ error: "La imagen excede el tamano permitido" });
  }

  return next(err);
}
