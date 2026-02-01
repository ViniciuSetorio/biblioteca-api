import { useState } from 'react'
import { useForm } from 'react-hook-form'

const UsuarioForm = ({ usuario, onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: usuario || {
      nome: '',
      email: '',
      cargo: 'membro'
    }
  })

  const [loading, setLoading] = useState(false)

  const handleFormSubmit = async (data) => {
    setLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">
        {usuario ? 'Editar Usuário' : 'Novo Usuário'}
      </h2>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nome">
            Nome *
          </label>
          <input
            id="nome"
            type="text"
            {...register('nome', { required: 'Nome é obrigatório' })}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.nome ? 'border-red-500' : ''
            }`}
            placeholder="Digite o nome completo"
          />
          {errors.nome && (
            <p className="text-red-500 text-xs italic mt-1">{errors.nome.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email *
          </label>
          <input
            id="email"
            type="email"
            {...register('email', { 
              required: 'Email é obrigatório',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email inválido'
              }
            })}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.email ? 'border-red-500' : ''
            }`}
            placeholder="exemplo@email.com"
          />
          {errors.email && (
            <p className="text-red-500 text-xs italic mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cargo">
            Cargo *
          </label>
          <select
            id="cargo"
            {...register('cargo', { required: 'Cargo é obrigatório' })}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.cargo ? 'border-red-500' : ''
            }`}
          >
            <option value="membro">Membro</option>
            <option value="bibliotecario">Bibliotecário</option>
          </select>
          {errors.cargo && (
            <p className="text-red-500 text-xs italic mt-1">{errors.cargo.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? 'Salvando...' : usuario ? 'Atualizar' : 'Criar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

export default UsuarioForm