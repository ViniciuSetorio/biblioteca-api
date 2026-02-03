import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Clock, User, BookOpen, AlertCircle, CheckCircle, Plus, X, Calendar, Info } from 'lucide-react'

const ReservaForm = ({ usuarios, livros, onSubmit, onCancel }) => {
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

  const SelectField = ({ label, name, options, icon: Icon, validation, children }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        <span className="flex items-center space-x-2">
          {Icon && <Icon size={14} />}
          <span>{label}</span>
          {validation?.required && <span className="text-red-500">*</span>}
        </span>
      </label>
      <div className="relative">
        <select
          {...register(name, validation)}
          className={`w-full px-4 py-3 pl-10 pr-10 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none focus:outline-none transition-all duration-200 ${
            errors[name] 
              ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 dark:border-gray-600 focus:ring-vue-green focus:border-vue-green'
          }`}
        >
          {options}
        </select>
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <Icon size={18} />
          </div>
        )}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {errors[name] && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
          <AlertCircle size={14} />
          <span>{errors[name].message}</span>
        </p>
      )}
      {children}
    </div>
  )

  return (
    <div className="animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header do Form */}
        <div className="bg-gradient-to-r from-vue-green to-vue-blue px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Nova Reserva</h2>
                <p className="text-white/80 text-sm">Reserve um livro para um usuário</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Usuário */}
            <SelectField
              label="Usuário"
              name="usuarioId"
              icon={User}
              validation={{ required: 'Selecione um usuário' }}
              options={
                <>
                  <option value="">Selecione um usuário...</option>
                  {usuarios
                    .filter(u => u.cargo === 'membro')
                    .map(usuario => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nome} ({usuario.email})
                      </option>
                    ))
                  }
                </>
              }
            />

            {/* Livro */}
            <SelectField
              label="Livro"
              name="livroId"
              icon={BookOpen}
              validation={{ required: 'Selecione um livro' }}
              options={
                <>
                  <option value="">Selecione um livro...</option>
                  {livros.map(livro => (
                    <option key={livro.id} value={livro.id}>
                      {livro.titulo} - {livro.autor} ({livro.copias_disponiveis} cópias)
                    </option>
                  ))}
                </>
              }
            />
          </div>

          {/* Preview do Livro */}
          {livroSelecionado && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 animate-fadeIn">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <BookOpen className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">
                      Informações do Livro
                    </h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      livroSelecionado.copias_disponiveis > 0 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {livroSelecionado.copias_disponiveis} cópias disponíveis
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 dark:text-gray-400">Título:</span>
                        <span className="text-gray-900 dark:text-gray-200 font-medium truncate">
                          {livroSelecionado.titulo}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 dark:text-gray-400">Autor:</span>
                        <span className="text-gray-900 dark:text-gray-200">{livroSelecionado.autor}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 dark:text-gray-400">ISBN:</span>
                        <span className="text-gray-900 dark:text-gray-200">
                          {livroSelecionado.isbn || 'N/A'}
                        </span>
                      </div>
                      {livroSelecionado.publicado_em && (
                        <div className="flex items-center space-x-2">
                          <Calendar size={12} className="text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Publicado:</span>
                          <span className="text-gray-900 dark:text-gray-200">
                            {new Date(livroSelecionado.publicado_em).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {livroSelecionado.copias_disponiveis === 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg animate-pulse">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={16} />
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          ⚠️ Este livro não possui cópias disponíveis. A reserva será criada para quando houver disponibilidade.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Informações da Reserva */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                <Info className="text-purple-600 dark:text-purple-400" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-1">
                  Como funcionam as reservas?
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  • Reservas válidas por 3 dias<br/>
                  • Prioridade por ordem de chegada<br/>
                  • Notificação por e-mail quando disponível
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <X size={16} />
              <span>Cancelar</span>
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
                  <Plus size={16} />
                  <span>Criar Reserva</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReservaForm