import React, { useState, useRef } from "react"
import { Helmet } from "react-helmet"
import { useTheme } from "../components/ThemeProvider"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import { Button } from "../components/ui/button"
import { FolderOpen, User, Camera, Lock, Save, Moon, Sun } from "lucide-react"
import Sidebar from "../components/Sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Separator } from "../components/ui/separator"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { toast } from "sonner"

const Settings = () => {
  const { theme, setTheme } = useTheme()
  const [scanFolder, setScanFolder] = useState(
    localStorage.getItem("scanFolder") || ""
  )
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "Usuario"
  )
  const [avatarUrl, setAvatarUrl] = useState(
    localStorage.getItem("avatarUrl") || ""
  )
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const fileInputRef = useRef(null)

  const handleDarkModeChange = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleScanFolderChange = e => {
    const path = e.target.value
    setScanFolder(path)
    localStorage.setItem("scanFolder", path)
  }

  const handleUsernameChange = e => {
    setUsername(e.target.value)
  }

  const saveUsername = () => {
    localStorage.setItem("username", username)
    toast.success("Nombre de usuario actualizado")
  }

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = e => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = e => {
        const result = e.target?.result
        setAvatarUrl(result)
        localStorage.setItem("avatarUrl", result)
        toast.success("Foto de perfil actualizada")
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePasswordSubmit = e => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    // Here you would normally verify the current password and update with new password
    // For this demo, we'll just simulate success
    localStorage.setItem("hasPassword", "true")
    toast.success("Contraseña actualizada correctamente")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Helmet>
        <title>Configuración</title>
      </Helmet>
      <Sidebar />
      <div className="flex-1 ml-16 p-6">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Configuración</h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-3">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="security">Seguridad</TabsTrigger>
              <TabsTrigger value="appearance">Apariencia</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información de Perfil
                  </CardTitle>
                  <CardDescription>
                    Actualiza tu información de perfil y cómo te ven los demás
                    en el sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div
                      className="relative cursor-pointer group"
                      onClick={handleAvatarClick}
                    >
                      <Avatar className="h-24 w-24 border-2 border-border">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="text-2xl bg-purple-100 dark:bg-purple-950 text-purple-500">
                          {username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      <div className="space-y-2">
                        <Label htmlFor="username">Nombre de Usuario</Label>
                        <div className="flex gap-2">
                          <Input
                            id="username"
                            value={username}
                            onChange={handleUsernameChange}
                            placeholder="Tu nombre de usuario"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={saveUsername}
                            title="Guardar nombre de usuario"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Configuración de Documentos
                  </CardTitle>
                  <CardDescription>
                    Configura dónde se almacenan y procesan tus documentos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Label
                      htmlFor="scan-folder"
                      className="text-base font-medium"
                    >
                      Carpeta de Documentos
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Selecciona la carpeta principal desde donde se leerán los
                      archivos
                    </p>
                    <div className="flex gap-2">
                      <Input
                        id="scan-folder"
                        placeholder="Ej: /Usuarios/MiUsuario/Documentos"
                        value={scanFolder}
                        onChange={handleScanFolderChange}
                        className="flex-1"
                      />
                      <Button variant="outline" size="icon">
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Cambiar Contraseña
                  </CardTitle>
                  <CardDescription>
                    Actualiza tu contraseña para mantener tu cuenta segura.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handlePasswordSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">
                        Contraseña Actual
                      </Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nueva Contraseña</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirmar Nueva Contraseña
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="ml-auto">
                      Actualizar Contraseña
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {theme === "dark" ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Sun className="h-5 w-5" />
                    )}
                    Apariencia
                  </CardTitle>
                  <CardDescription>
                    Personaliza la apariencia visual de la aplicación.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label
                          htmlFor="dark-mode"
                          className="text-base font-medium"
                        >
                          Modo Oscuro
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Cambia entre modo claro y oscuro
                        </p>
                      </div>
                      <Switch
                        id="dark-mode"
                        checked={theme === "dark"}
                        onCheckedChange={handleDarkModeChange}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label className="text-base font-medium">
                        Color del Tema
                      </Label>
                      <RadioGroup
                        defaultValue="crimson"
                        className="grid grid-cols-3 gap-4"
                      >
                        <Label
                          htmlFor="crimson"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <RadioGroupItem
                            value="crimson"
                            id="crimson"
                            className="sr-only"
                          />
                          <div className="mb-2 h-5 w-5 rounded-full bg-crimson" />
                          <span className="text-sm">Crimson</span>
                        </Label>
                        <Label
                          htmlFor="blue"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <RadioGroupItem
                            value="blue"
                            id="blue"
                            className="sr-only"
                          />
                          <div className="mb-2 h-5 w-5 rounded-full bg-blue-600" />
                          <span className="text-sm">Azul</span>
                        </Label>
                        <Label
                          htmlFor="green"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <RadioGroupItem
                            value="green"
                            id="green"
                            className="sr-only"
                          />
                          <div className="mb-2 h-5 w-5 rounded-full bg-green-600" />
                          <span className="text-sm">Verde</span>
                        </Label>
                      </RadioGroup>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default Settings
