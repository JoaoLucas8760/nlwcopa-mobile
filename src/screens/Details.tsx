import { HStack, useToast, VStack } from "native-base";
import { Share } from "react-native";
import { Header } from "../components/Header";

import { api } from "../services/api";

import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Loading } from "../components/Loading";
import { PoolCardProps } from "../components/PoolCard";
import { PoolHeader } from "../components/PoolHeader";
import { Guesses } from "../components/Guesses";
import { EmptyMyPoolList } from "../components/EmptyMyPoolList";
import { Option } from "../components/Option";

interface RouteParams {
  id: string;
}

export function Details() {
  const [optionsSelected, setOptionsSelected] = useState<"guesses" | "ranking">(
    "guesses"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [poolDetails, setPoolDetails] = useState<PoolCardProps>(
    {} as PoolCardProps
  );
  const toast = useToast();
  const route = useRoute();
  const { id } = route.params as RouteParams;

  async function FetchPoolDetails() {
    try {
      setIsLoading(true);

      const response = await api.get(`/pools/${id}`);
      setPoolDetails(response.data.pool);
    } catch (error) {
      console.log(error);

      toast.show({
        title: "Não foin possivel carregar os detalhes do bolão",
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }
  async function handleCodeShare() {
    await Share.share({
      message: `Junte se ao meu bolão\nCODIGO: ${poolDetails.code}`,
    });
  }

  useEffect(() => {
    FetchPoolDetails();
  }, [id]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <VStack flex={1} bgColor="gray.900">
      <Header
        title={poolDetails.title}
        showBackButton
        showShareButton
        onShare={handleCodeShare}
      />

      {poolDetails._count?.participants > 0 ? (
        <VStack px={5} flex={1}>
          <PoolHeader data={poolDetails} />

          <HStack bgColor="gray.800" p={1} rounded="sm" mb={5}>
            <Option
              title="Seus palpites"
              isSelected={optionsSelected === "guesses"}
              onPress={() => setOptionsSelected("guesses")}
            />
            <Option
              title="Ranking do grupo"
              isSelected={optionsSelected === "ranking"}
              onPress={() => setOptionsSelected("ranking")}
            />
          </HStack>
          <Guesses poolId={poolDetails.id} />
        </VStack>
      ) : (
        <EmptyMyPoolList code={poolDetails.code} />
      )}
    </VStack>
  );
}
