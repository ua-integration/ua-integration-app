import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetIcon,
  ActionsheetItem,
  ActionsheetItemText,
  Box,
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
  Center,
  Heading,
  HStack,
  Icon,
  Spinner,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { useFocusEffect, useRouter } from 'expo-router';
import i18n from 'i18n-js';
import {
  MoreHorizontal as MoreHorizontalIcon,
  Video as VideoIcon,
  Heart as HeartIcon,
  HeartOff as HeartOffIcon,
  Pencil as PencilIcon,
} from 'lucide-react-native';
import { useState, useRef, useCallback } from 'react';
import { InView } from 'react-native-intersection-observer';
import { useShallow } from 'zustand/react/shallow';

import getButtonStatus, { ButtonStatus } from '@/api/getButtonStatus';
import { Control } from '@/api/getControls';
import runCommand from '@/api/runCommand';
import Card from '@/components/Card';
import Skeleton from '@/components/Skeleton';
import { useAuthContext } from '@/contexts/AuthContext';
import useAppState from '@/hooks/useAppState';
import ControlRenameModal from '@/screens/ControlsScreen/ControlRenameModal';
import useControlsStore from '@/stores/useControlsStore';

type ControlCardProps = {
  control: Control;
};

const ControlCard = ({ control }: ControlCardProps) => {
  const router = useRouter();

  const { authState } = useAuthContext();

  const { appState } = useAppState();

  const { favorites, toggleFavorite, renameControl } = useControlsStore(
    useShallow((state) => ({
      favorites: state.favorites,
      toggleFavorite: state.toggleFavorite,
      renameControl: state.renameControl,
    }))
  );

  const [buttonStatus, setButtonStatus] = useState<ButtonStatus | null>(null);
  const [inView, setInView] = useState(false);
  const [isRunCommand, setIsRunCommand] = useState(false);

  const [showOpenConfirmActionsheet, setShowOpenConfirmActionsheet] =
    useState(false);
  const [showMoreActionsActionsheet, setShowMoreActionsActionsheet] =
    useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout>();

  const handleRunCommand = async () => {
    if (authState.type !== 'authenticated') {
      return;
    }

    try {
      setIsRunCommand(true);
      await runCommand({
        apiURL: authState.session.apiURL,
        token: authState.session.token,
        command: control.command,
      });
      setButtonStatus('open');
      setShowOpenConfirmActionsheet(false);
    } finally {
      setIsRunCommand(false);
    }
  };

  const handleVideoPress = () => {
    router.push('/camera');
  };

  const handleMoreActionsPress = () => {
    setShowMoreActionsActionsheet(true);
  };

  useFocusEffect(
    useCallback(() => {
      const getButtonStatusRequest = async () => {
        if (authState.type !== 'authenticated') {
          return;
        }

        const data = await getButtonStatus({
          apiURL: authState.session.apiURL,
          token: authState.session.token,
          command: control.command,
        });
        setButtonStatus(data);
      };

      if (appState === 'active' && inView) {
        getButtonStatusRequest();
        intervalRef.current = setInterval(getButtonStatusRequest, 3000);
      }

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [authState, appState, inView])
  );

  if (buttonStatus === null) {
    return (
      <InView onChange={setInView}>
        <Card>
          <VStack p="$4" space="md">
            <VStack space="md">
              <HStack space="md" justifyContent="space-between">
                <Skeleton width={64} height={20} borderRadius={5} />
                <HStack space="3xl">
                  <Skeleton width={24} height={24} borderRadius={5} />
                  <Skeleton width={24} height={24} borderRadius={5} />
                </HStack>
              </HStack>
              <Skeleton width={124} height={22} borderRadius={5} />
            </VStack>
            <Skeleton width="100%" height={40} borderRadius={5} />
          </VStack>
        </Card>
      </InView>
    );
  }

  return (
    <>
      <Actionsheet
        isOpen={showOpenConfirmActionsheet}
        onClose={() => {
          setShowOpenConfirmActionsheet(false);
        }}
        closeOnOverlayClick={!isRunCommand}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent h={180}>
          {isRunCommand ? (
            <Center w="$full" h="$full">
              <Spinner size="large" />
            </Center>
          ) : (
            <>
              <ActionsheetDragIndicatorWrapper>
                <ActionsheetDragIndicator />
              </ActionsheetDragIndicatorWrapper>
              <VStack w="$full" h="$full" px={20} pt={8} p={30}>
                <VStack flex={1}>
                  <Heading size="lg" numberOfLines={1}>
                    {control.name}
                  </Heading>
                  <Text size="md">
                    {i18n.t('controls.open_confirm.subtitle')}
                  </Text>
                </VStack>
                <HStack alignItems="center" space="md">
                  <Button
                    flex={1}
                    variant="outline"
                    size="sm"
                    action="secondary"
                    mr="$3"
                    onPress={() => {
                      setShowOpenConfirmActionsheet(false);
                    }}
                    isDisabled={isRunCommand}
                  >
                    <ButtonText>{i18n.t('button.cancel')}</ButtonText>
                  </Button>
                  <Button
                    flex={1}
                    size="sm"
                    action="positive"
                    borderWidth="$0"
                    onPress={() => {
                      handleRunCommand();
                    }}
                    isDisabled={isRunCommand}
                  >
                    {isRunCommand && <ButtonSpinner mr="$1" />}
                    <ButtonText>{i18n.t('button.open')}</ButtonText>
                  </Button>
                </HStack>
              </VStack>
            </>
          )}
        </ActionsheetContent>
      </Actionsheet>

      <Actionsheet
        isOpen={showMoreActionsActionsheet}
        onClose={() => {
          setShowMoreActionsActionsheet(false);
        }}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent h={148}>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <ActionsheetItem
            onPress={() => {
              setShowMoreActionsActionsheet(false);
              setShowRenameModal(true);
            }}
          >
            <ActionsheetIcon size="md">
              <Icon as={PencilIcon} />
            </ActionsheetIcon>
            <ActionsheetItemText>{i18n.t('button.rename')}</ActionsheetItemText>
          </ActionsheetItem>
          {favorites.includes(control.id) ? (
            <ActionsheetItem
              onPress={() => {
                setShowMoreActionsActionsheet(false);
                toggleFavorite(control.id);
              }}
            >
              <ActionsheetIcon size="md">
                <Icon as={HeartOffIcon} />
              </ActionsheetIcon>
              <ActionsheetItemText>
                {i18n.t('button.favorite_remove')}
              </ActionsheetItemText>
            </ActionsheetItem>
          ) : (
            <ActionsheetItem
              onPress={() => {
                setShowMoreActionsActionsheet(false);
                toggleFavorite(control.id);
              }}
            >
              <ActionsheetIcon size="md">
                <Icon as={HeartIcon} />
              </ActionsheetIcon>
              <ActionsheetItemText>
                {i18n.t('button.favorite_add')}
              </ActionsheetItemText>
            </ActionsheetItem>
          )}
        </ActionsheetContent>
      </Actionsheet>

      <ControlRenameModal
        name={control.name}
        isOpen={showRenameModal}
        onSave={(name) => {
          renameControl(control.id, name);
          setShowRenameModal(false);
        }}
        onClose={() => {
          setShowRenameModal(false);
        }}
      />

      <InView onChange={setInView}>
        <Card>
          <VStack p="$4" space="md">
            <VStack>
              <HStack space="md" justifyContent="space-between">
                <Box h="$6">
                  {buttonStatus === 'online' || buttonStatus === 'open' ? (
                    <Text color="$green500" size="sm">
                      {i18n.t('status.online')}
                    </Text>
                  ) : (
                    <Text color="$red500" size="sm">
                      {i18n.t('status.offline')}
                    </Text>
                  )}
                </Box>

                <HStack space="3xl">
                  <Button size="xs" variant="link" onPress={handleVideoPress}>
                    <ButtonIcon as={VideoIcon} size="xl" />
                  </Button>
                  <Button
                    size="xs"
                    variant="link"
                    onPress={handleMoreActionsPress}
                  >
                    <ButtonIcon as={MoreHorizontalIcon} size="xl" />
                  </Button>
                </HStack>
              </HStack>
              <Text size="md" fontWeight="$bold" numberOfLines={1}>
                {control.name}
              </Text>
            </VStack>
            <Button
              action={buttonStatus === 'offline' ? 'secondary' : 'primary'}
              onPress={() => {
                setShowOpenConfirmActionsheet(true);
              }}
              isDisabled={buttonStatus !== 'online'}
            >
              <ButtonText>
                {buttonStatus === 'open'
                  ? i18n.t('button.opened')
                  : i18n.t('button.open')}
              </ButtonText>
            </Button>
          </VStack>
        </Card>
      </InView>
    </>
  );
};

export default ControlCard;
