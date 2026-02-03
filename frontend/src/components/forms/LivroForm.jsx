import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { BookOpen, User, Hash, Calendar, Copy, Plus, X, AlertCircle, Save } from 'lucide-react'

const LivroForm = ({ livro, usuarios, onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: livro || {
      titulo: '',
      autor: '',
      isbn: '',
      publicado_em: '',
      criado_por: '',
      copias_disponiveis: 1
    }
  })

  const [loading, setLoading] = useState(false)
  const [isbnCopied, setIsbnCopied] = useState(false)

  useEffect(() => {
    if (!usuarios) {
      fetchUsuarios()
    }
  }, [])

  const fetchUsuarios = async () => {
    try {
      // Em um caso real, você buscaria os usuários aqui
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    }
  }

  const handleFormSubmit = async (data) => {
    setLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyISBN = () => {
    const isbnField = document.getElementById('isbn')
    if (isbnField?.value) {
      navigator.clipboard.writeText(isbnField.value)
      setIsbnCopied(true)
      setTimeout(() => setIsbnCopied(false), 2000)
    }
  }

  const InputField = ({ label, name, type = 'text', placeholder, icon: Icon, validation, ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        <span className="flex items-center space-x-2">
          {Icon && <Icon size={14} />}
          <span>{label}</span>
          {validation?.required && <span className="text-red-500">*</span>}
        </span>
      </label>
      <div className="relative">
        <input
          type={type}
          {...register(name, validation)}
          className={`w-full px-4 py-3 pl-10 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-all duration-200 ${
            errors[name] 
              ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 dark:border-gray-600 focus:ring-vue-green focus:border-vue-green'
          }`}
          placeholder={placeholder}
          {...props}
        />
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <Icon size={18} />
          </div>
        )}
      </div>
      {errors[name] && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
          <AlertCircle size={14} />
          <span>{errors[name].message}</span>
        </p>
      )}
    </div>
  )

  const SelectField = ({ label, name, options, icon: Icon, validation }) => (
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
                <BookOpen className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {livro ? 'Editar Livro' : 'Novo Livro'}
                </h2>
                <p className="text-white/80 text-sm">
                  {livro ? 'Atualize as informações do livro' : 'Adicione um novo livro ao catálogo'}
                </p>
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
            {/* Coluna 1 */}
            <div className="space-y-6">
              <InputField
                label="Título"
                name="titulo"
                icon={BookOpen}
                placeholder="Digite o título do livro"
                validation={{ required: 'Título é obrigatório' }}
              />

              <InputField
                label="Autor"
                name="autor"
                placeholder="Digite o nome do autor"
                validation={{ required: 'Autor é obrigatório' }}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span className="flex items-center space-x-2">
                    <Hash size={14} />
                    <span>ISBN</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="isbn"
                    type="text"
                    {...register('isbn')}
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vue-green focus:border-vue-green transition-all duration-200"
                    placeholder="Ex: 978-85-333-0227-3"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                    <Hash size={18} />
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyISBN}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-vue-green transition-colors"
                    title="Copiar ISBN"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                {isbnCopied && (
                  <p className="text-sm text-green-600 dark:text-green-400 animate-fadeIn">
                    ISBN copiado para a área de transferência!
                  </p>
                )}
              </div>
            </div>

            {/* Coluna 2 */}
            <div className="space-y-6">
              <InputField
                label="Data de Publicação"
                name="publicado_em"
                type="date"
                icon={Calendar}
              />

              <SelectField
                label="Criado por (Bibliotecário)"
                name="criado_por"
                icon={User}
                options={
                  <>
                    <option value="">Selecione um bibliotecário...</option>
                    {usuarios && usuarios
                      .filter(u => u.cargo === 'bibliotecario')
                      .map(usuario => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.nome} ({usuario.email})
                        </option>
                      ))
                    }
                  </>
                }
                validation={{ valueAsNumber: true }}
              />

              <InputField
                label="Cópias Disponíveis"
                name="copias_disponiveis"
                type="number"
                min="0"
                icon={Copy}
                placeholder="0"
                validation={{ 
                  required: 'Número de cópias é obrigatório',
                  min: { value: 0, message: 'Não pode ser negativo' },
                  valueAsNumber: true
                }}
              />
            </div>
          </div>

          {/* Informações do Estoque */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <BookOpen className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                  Informações de Estoque
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Configure o número de cópias disponíveis para empréstimo
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
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  {livro ? <Save size={16} /> : <Plus size={16} />}
                  <span>{livro ? 'Atualizar' : 'Criar Livro'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LivroForm