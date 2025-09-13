export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-cream via-pastel-vanilla to-pastel-blush flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <h2 className="font-display text-xl font-semibold text-primary-800 mb-2">
          Carregando...
        </h2>
        <p className="text-primary-600">
          Preparando os melhores sabores para você
        </p>
      </div>
    </div>
  );
}