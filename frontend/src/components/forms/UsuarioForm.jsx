import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Mail, Shield, AlertCircle, Plus, Save, X, Key, BadgeCheck } from 'lucide-react'

const UsuarioForm = ({ usuario, onSubmit, onCancel }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: usuario || {
      nome: '',
      email: '',
      cargo: 'membro'
    }
  })

  const [loading, setLoading] = useState(false)
  const cargo = watch('cargo')

  const handleFormSubmit = async (data) => {
    setLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setLoading(false)
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
                <User className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {usuario ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
                <p className="text-white/80 text-sm">
                  {usuario ? 'Atualize as informações do usuário' : 'Cadastre um novo usuário no sistema'}
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
            {/* Nome */}
            <InputField
              label="Nome Completo"
              name="nome"
              icon={User}
              placeholder="Digite o nome completo"
              validation={{ required: 'Nome é obrigatório' }}
            />

            {/* Email */}
            <InputField
              label="E-mail"
              name="email"
              type="email"
              icon={Mail}
              placeholder="exemplo@email.com"
              validation={{ 
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              }}
            />
          </div>

          {/* Cargo */}
          <SelectField
            label="Cargo"
            name="cargo"
            icon={Shield}
            validation={{ required: 'Cargo é obrigatório' }}
            options={
              <>
                <option value="membro">Membro</option>
                <option value="bibliotecario">Bibliotecário</option>
              </>
            }
          />

          {/* Informações do Cargo */}
          <div className={`rounded-xl p-4 border transition-all duration-300 ${
            cargo === 'bibliotecario'
              ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800'
              : 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800'
          }`}>
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${
                cargo === 'bibliotecario'
                  ? 'bg-purple-100 dark:bg-purple-900/40'
                  : 'bg-blue-100 dark:bg-blue-900/40'
              }`}>
                {cargo === 'bibliotecario' ? (
                  <Shield className="text-purple-600 dark:text-purple-400" size={20} />
                ) : (
                  <User className="text-blue-600 dark:text-blue-400" size={20} />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1" style={{
                  color: cargo === 'bibliotecario' 
                    ? 'var(--purple-800, #6d28d9)' 
                    : 'var(--blue-800, #1e40af)'
                }}>
                  {cargo === 'bibliotecario' ? 'Bibliotecário' : 'Membro'} - Permissões
                </h4>
                <ul className="text-sm space-y-1" style={{
                  color: cargo === 'bibliotecario' 
                    ? 'var(--purple-700, #7c3aed)' 
                    : 'var(--blue-700, #1d4ed8)'
                }}>
                  {cargo === 'bibliotecario' ? (
                    <>
                      <li>• Cadastrar e editar livros</li>
                      <li>• Gerenciar empréstimos</li>
                      <li>• Registrar devoluções</li>
                      <li>• Aplicar multas</li>
                    </>
                  ) : (
                    <>
                      <li>• Realizar empréstimos de livros</li>
                      <li>• Fazer reservas</li>
                      <li>• Visualizar histórico</li>
                      <li>• Renovar empréstimos</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Informações de Segurança */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <Key className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">
                  Informações de Segurança
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Uma senha temporária será enviada por e-mail para o primeiro acesso
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
                  {usuario ? <Save size={16} /> : <Plus size={16} />}
                  <span>{usuario ? 'Atualizar' : 'Criar Usuário'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UsuarioForm