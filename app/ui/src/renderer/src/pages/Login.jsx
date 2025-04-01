import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { User, KeyRound, LogIn } from "lucide-react"
import { FirstTimeLoginModal } from "../components/FirstTimeLoginModal"
import { useToast } from "../hooks/use-toast"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isReturningUser, setIsReturningUser] = useState(false)
  const [username, setUsername] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Check if user has logged in before
  useEffect(() => {
    const previousLogin = localStorage.getItem("previousLogin")
    const storedUsername = localStorage.getItem("username")
    const storedAvatar = localStorage.getItem("avatarUrl")

    if (previousLogin === "true" && storedUsername) {
      setIsReturningUser(true)
      setUsername(storedUsername)
      if (storedAvatar) {
        setAvatarUrl(storedAvatar)
      }
    }
  }, [])

  const handleSubmit = e => {
    e.preventDefault()

    // This would normally connect to a real backend
    // For now, we'll simulate a successful login
    if (
      (isReturningUser && password.length > 0) ||
      (!isReturningUser && email && password.length > 0)
    ) {
      // Check if it's first time login (this would be determined by the backend)
      const isFirstLogin = !localStorage.getItem("previousLogin")

      if (isFirstLogin) {
        // Show the first-time login modal
        setShowFirstTimeModal(true)

        // Store username for next login
        if (!isReturningUser && email) {
          const username = email.split("@")[0]
          localStorage.setItem("username", username)
          setUsername(username)
        }
      } else {
        // Regular login success
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido de nuevo al sistema."
        })
        navigate("/")
      }
    } else {
      // Show error for invalid credentials
      toast({
        title: "Error de inicio de sesión",
        description: "Credenciales inválidas. Por favor intente de nuevo.",
        variant: "destructive"
      })
    }
  }

  const handleFirstTimeSetupComplete = () => {
    // Mark that the user has logged in before
    localStorage.setItem("previousLogin", "true")
    setShowFirstTimeModal(false)
    navigate("/")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md mx-auto">
        <div className="glass-panel p-8 shadow-lg">
          <div className="flex flex-col items-center space-y-6">
            <h1 className="text-2xl font-bold text-center">Proyecto</h1>

            {isReturningUser ? (
              <div className="flex flex-col items-center space-y-4 w-full">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarUrl} alt={username} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-medium">Hola {username}</h2>
              </div>
            ) : (
              <div className="rounded-full bg-primary/10 p-3">
                <User className="h-8 w-8 text-primary" />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              {!isReturningUser && (
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="nombre@ejemplo.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="pl-10"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10"
                  />
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2">
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </Button>
            </form>

            {!isReturningUser && (
              <p className="text-sm text-center text-muted-foreground mt-4">
                ¿No tiene una cuenta?{" "}
                <a href="#" className="text-primary hover:underline">
                  Regístrese
                </a>
              </p>
            )}
          </div>
        </div>
      </div>

      {showFirstTimeModal && (
        <FirstTimeLoginModal onComplete={handleFirstTimeSetupComplete} />
      )}
    </div>
  )
}

export default Login
