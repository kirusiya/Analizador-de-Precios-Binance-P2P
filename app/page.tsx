"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PriceDisplay } from "@/components/price-display"
import { AdvertisersTable } from "@/components/advertisers-table"
import { ArrowDownUp, RefreshCw, ArrowDown, ArrowUp, AlertCircle, Award, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PriceProjection } from "@/components/price-projection"

interface Advertiser {
  nickName: string
  userNo: string
  monthOrderCount: number
  monthFinishRate: number
  positiveRate: number
  userType: string
  isVerified: boolean
  proMerchant: boolean
}

interface Advertisement {
  advertiser: Advertiser
  price: number
  available: number
  limits: {
    min: number
    max: number
    minInUSDT: number
    maxInUSDT: number
  }
  payMethods: string[]
  orderCount: number
  completionRate: number
  averageTime: number
}

interface P2PData {
  timestamp: string
  tradeType: string
  priceStats: {
    min: string
    max: string
    spread: string
  }
  sampleSize: number
  advertisements: Advertisement[]
  filterInfo: {
    minOrders: number
    totalCount: number
    verifiedCount: number
    usingAllAds: boolean
  }
}

export default function Home() {
  const [sellData, setSellData] = useState<P2PData | null>(null)
  const [buyData, setBuyData] = useState<P2PData | null>(null)
  const [isLoadingSell, setIsLoadingSell] = useState(false)
  const [isLoadingBuy, setIsLoadingBuy] = useState(false)
  const [activeTab, setActiveTab] = useState("sell")
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Función para obtener datos de venta (SELL)
  const fetchSellData = async () => {
    setIsLoadingSell(true)
    setError(null)
    try {
      // Añadir timestamp para evitar caché
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/binance-p2p?tradeType=SELL&t=${timestamp}&retry=${retryCount}`)
      const data = await response.json()

      if (response.ok) {
        setSellData(data)
        setLastUpdated(new Date().toLocaleTimeString())
      } else {
        console.error("Error al obtener datos de venta:", data.error)
        setError(data.message || data.error || "Error al obtener datos de venta")
      }
    } catch (error) {
      console.error("Error en la solicitud:", error)
      setError("Error de conexión. Intenta nuevamente.")
    } finally {
      setIsLoadingSell(false)
    }
  }

  // Función para obtener datos de compra (BUY)
  const fetchBuyData = async () => {
    setIsLoadingBuy(true)
    setError(null)
    try {
      // Añadir timestamp para evitar caché
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/binance-p2p?tradeType=BUY&t=${timestamp}&retry=${retryCount}`)
      const data = await response.json()

      if (response.ok) {
        setBuyData(data)
        setLastUpdated(new Date().toLocaleTimeString())
      } else {
        console.error("Error al obtener datos de compra:", data.error)
        setError(data.message || data.error || "Error al obtener datos de compra")
      }
    } catch (error) {
      console.error("Error en la solicitud:", error)
      setError("Error de conexión. Intenta nuevamente.")
    } finally {
      setIsLoadingBuy(false)
    }
  }

  // Función para actualizar ambos datos
  const fetchAllData = () => {
    setRetryCount((prev) => prev + 1) // Incrementar contador de reintentos
    fetchSellData()
    fetchBuyData()
  }

  // Cargar datos iniciales
  useEffect(() => {
    fetchAllData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Obtener el número mínimo de órdenes del filtro
  const getMinOrders = () => {
    const data = activeTab === "sell" ? sellData : buyData
    return data?.filterInfo?.minOrders || 500
  }

  // Verificar si se están mostrando todos los anuncios (sin filtro de órdenes)
  const isShowingAllAds = () => {
    const data = activeTab === "sell" ? sellData : buyData
    return data?.filterInfo?.usingAllAds || false
  }

  return (
    <main className="container mx-auto p-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-4">Analizador de Precios Binance P2P</h1>

      <div className="flex items-center justify-center gap-2 mb-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="px-3 py-1 bg-amber-50 text-gray-800">
                  <Award className="h-4 w-4 text-amber-600 mr-1" />
                  {isShowingAllAds()
                    ? "Mostrando todos los anunciantes"
                    : `Anunciantes con más de ${getMinOrders()} órdenes`}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isShowingAllAds()
                  ? "Mostrando todos los anunciantes disponibles ordenados por experiencia"
                  : "Solo se muestran anunciantes con experiencia comprobada (más de 500 órdenes)"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchAllData} className="self-start">
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-8">
        <div className="text-sm text-muted-foreground">
          {lastUpdated && <span>Última actualización: {lastUpdated}</span>}
        </div>
        <Button onClick={fetchAllData} className="px-8">
          {isLoadingSell || isLoadingBuy ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Actualizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar Todos los Datos
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Tarjeta de Venta (SELL) */}
        <Card className={activeTab === "sell" ? "ring-2 ring-primary" : ""}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <ArrowDown className="mr-2 h-5 w-5 text-green-500" />
                Vender USDT / Comprar BOB
              </CardTitle>
              <Badge variant="outline" className="bg-green-50 text-gray-800">
                SELL
              </Badge>
            </div>
            <CardDescription>Anuncios para vender USDT y recibir BOB (anunciantes con experiencia)</CardDescription>
          </CardHeader>
          <CardContent>
            <PriceDisplay data={sellData} isLoading={isLoadingSell} type="sell" />
          </CardContent>
          <CardFooter>
            <Button
              disabled={isLoadingSell}
              className="w-full"
              variant={activeTab === "sell" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("sell")
                fetchSellData()
              }}
            >
              {isLoadingSell ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Ver Anuncios de Venta
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Tarjeta de Compra (BUY) */}
        <Card className={activeTab === "buy" ? "ring-2 ring-primary" : ""}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <ArrowUp className="mr-2 h-5 w-5 text-blue-500" />
                Comprar USDT / Vender BOB
              </CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-gray-800">
                BUY
              </Badge>
            </div>
            <CardDescription>Anuncios para comprar USDT y enviar BOB (anunciantes con experiencia)</CardDescription>
          </CardHeader>
          <CardContent>
            <PriceDisplay data={buyData} isLoading={isLoadingBuy} type="buy" />
          </CardContent>
          <CardFooter>
            <Button
              disabled={isLoadingBuy}
              className="w-full"
              variant={activeTab === "buy" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("buy")
                fetchBuyData()
              }}
            >
              {isLoadingBuy ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Ver Anuncios de Compra
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Tabla de Anunciantes */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowDownUp className="mr-2 h-5 w-5" />
            {activeTab === "sell" ? "Anuncios para Vender USDT" : "Anuncios para Comprar USDT"}
          </CardTitle>
          <CardDescription className="flex items-center gap-1">
            <Award className="h-4 w-4 text-amber-600" />
            {activeTab === "sell"
              ? "Anunciantes con experiencia que compran tus USDT y te pagan en BOB"
              : "Anunciantes con experiencia que venden USDT y reciben BOB"}
            {isShowingAllAds() && (
              <Badge variant="outline" className="ml-2 bg-yellow-50 text-gray-800">
                <Info className="h-3 w-3 mr-1" />
                Mostrando todos los anunciantes
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdvertisersTable
            data={activeTab === "sell" ? sellData : buyData}
            isLoading={activeTab === "sell" ? isLoadingSell : isLoadingBuy}
            type={activeTab}
          />
        </CardContent>
      </Card>

      {/* Proyección de precios - Ahora basada en los datos actuales */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            {activeTab === "sell" ? (
              <ArrowDown className="mr-2 h-5 w-5 text-green-500" />
            ) : (
              <ArrowUp className="mr-2 h-5 w-5 text-blue-500" />
            )}
            Proyección de Precios ({activeTab === "sell" ? "Venta" : "Compra"})
          </CardTitle>
          <CardDescription>Análisis predictivo basado en los datos actuales del mercado</CardDescription>
        </CardHeader>
        <CardContent>
          <PriceProjection
            advertisements={activeTab === "sell" ? sellData?.advertisements : buyData?.advertisements}
            tradeType={activeTab === "sell" ? "SELL" : "BUY"}
            isLoading={activeTab === "sell" ? isLoadingSell : isLoadingBuy}
          />
        </CardContent>
      </Card>
    </main>
  )
}
