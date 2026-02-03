import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PlusCircle, X, AlertCircle, CheckCircle } from 'lucide-react'

const EmprestimoForm = ({ usuarios, livros, onSubmit, onCancel }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)

  const livroId = watch('livroId')
  const livroSelecionado = livros.find(l => l.id === parseInt(livroId))

  const handleFormSubmit = async (data) => {
    setLoading(true)
    try {
      await onSubmit({
        usuarioId: parseInt(data.usuarioId),
        livroId: parseInt(data.livroId)
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header do Form */}
        <div className="bg-gradient-to-r from-vue-green to-vue-blue px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <PlusCircle className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Novo Empréstimo</h2>
                <p className="text-white/80 text-sm">Registre um novo empréstimo de livro</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="text-white" size={20} />
            </button>
          </div>
        </div>

        {/* Corpo do Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Campo Usuário */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="flex items-center space-x-2">
                <span>Usuário *</span>
                {errors.usuarioId && (
                  <AlertCircle className="text-red-500" size={14} />
                )}
              </span>
            </label>
            <div className="relative">
              <select
                {...register('usuarioId', { required: 'Selecione um usuário' })}
                className={`w-full px-4 py-3 pr-10 rounded-lg border ${
                  errors.usuarioId 
                    ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-vue-green focus:border-vue-green'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none transition-all duration-200`}
              >
                <option value="">Selecione um usuário...</option>
                {usuarios
                  .filter(u => u.cargo === 'membro')
                  .map(usuario => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nome} ({usuario.email})
                    </option>
                  ))
                }
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.usuarioId && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                <AlertCircle size={14} />
                <span>{errors.usuarioId.message}</span>
              </p>
            )}
          </div>

          {/* Campo Livro */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="flex items-center space-x-2">
                <span>Livro *</span>
                {errors.livroId && (
                  <AlertCircle className="text-red-500" size={14} />
                )}
              </span>
            </label>
            <div className="relative">
              <select
                {...register('livroId', { required: 'Selecione um livro' })}
                className={`w-full px-4 py-3 pr-10 rounded-lg border ${
                  errors.livroId 
                    ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-vue-green focus:border-vue-green'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none transition-all duration-200`}
              >
                <option value="">Selecione um livro...</option>
                {livros
                  .filter(l => l.copias_disponiveis > 0)
                  .map(livro => (
                    <option key={livro.id} value={livro.id}>
                      {livro.titulo} - {livro.autor} ({livro.copias_disponiveis} cópias)
                    </option>
                  ))
                }
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.livroId && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                <AlertCircle size={14} />
                <span>{errors.livroId.message}</span>
              </p>
            )}
          </div>

          {/* Preview do Livro */}
          {livroSelecionado && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 animate-fadeIn">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <CheckCircle className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Informações do Livro Selecionado
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Título:</span>
                      <span className="ml-2 text-gray-900 dark:text-gray-200 font-medium">
                        {livroSelecionado.titulo}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Autor:</span>
                      <span className="ml-2 text-gray-900 dark:text-gray-200">
                        {livroSelecionado.autor}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">ISBN:</span>
                      <span className="ml-2 text-gray-900 dark:text-gray-200">
                        {livroSelecionado.isbn || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Disponíveis:</span>
                      <span className={`ml-2 font-medium ${
                        livroSelecionado.copias_disponiveis > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {livroSelecionado.copias_disponiveis}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-vue-green to-vue-blue rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Criando...</span>
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  <span>Criar Empréstimo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmprestimoForm