import { ScreenContainer } from "@/components/screen-container";
import {
  addTimeLog,
  clockOutTimeLog,
  deleteTimeLog,
  Employee,
  getActiveTimeLog,
  getEmployees,
  getJobSites,
  JobSite,
  TimeLog,
} from "@/lib/local-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function ClockInOutScreen() {
  const colors = useColors();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jobSites, setJobSites] = useState<JobSite[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedJobSite, setSelectedJobSite] = useState<JobSite | null>(null);
  const [activeLog, setActiveLog] = useState<TimeLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const emps = await getEmployees();
      const sites = await getJobSites();
      setEmployees(emps);
      setJobSites(sites);

      if (emps.length > 0 && !selectedEmployee) {
        setSelectedEmployee(emps[0]);
      }
      if (sites.length > 0 && !selectedJobSite) {
        setSelectedJobSite(sites[0]);
      }

      if (selectedEmployee) {
        const active = await getActiveTimeLog(selectedEmployee.id);
        setActiveLog(active);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    if (!selectedEmployee || !selectedJobSite) {
      setMessage("Please select an employee and job site");
      return;
    }

    try {
      setLoading(true);
      await addTimeLog(selectedEmployee.id, selectedJobSite.id);
      const active = await getActiveTimeLog(selectedEmployee.id);
      setActiveLog(active);
      setMessage("Clocked in successfully");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      setMessage("Error clocking in");
      console.error("Error clocking in:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeLog) return;

    try {
      setLoading(true);
      await clockOutTimeLog(activeLog.id);
      setActiveLog(null);
      setMessage("Clocked out successfully");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      setMessage("Error clocking out");
      console.error("Error clocking out:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      setLoading(true);
      await deleteTimeLog(logId);
      if (activeLog?.id === logId) {
        setActiveLog(null);
      }
      setMessage("Time log deleted");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      setMessage("Error deleting log");
      console.error("Error deleting log:", error);
    } finally {
      setLoading(false);
    }
  };

  const getElapsedTime = (clockInTime: number) => {
    const elapsed = Date.now() - clockInTime;
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getJobSiteName = (siteId: string) => {
    return jobSites.find(s => s.id === siteId)?.name || "Unknown";
  };

  const getEmployeeName = (empId: string) => {
    return employees.find(e => e.id === empId)?.name || "Unknown";
  };

  if (loading && employees.length === 0) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Clock In/Out</Text>
            <Text className="text-sm text-muted">Select employee and job site</Text>
          </View>

          {/* Employee Selection */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-foreground">Select Employee</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <FlatList
                data={employees}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => setSelectedEmployee(item)}
                    style={{
                      backgroundColor:
                        selectedEmployee?.id === item.id ? colors.primary : colors.surface,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          selectedEmployee?.id === item.id ? "white" : colors.foreground,
                        fontSize: 16,
                        fontWeight: "500",
                      }}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          </View>

          {/* Job Site Selection */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-foreground">Select Job Site</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <FlatList
                data={jobSites}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => setSelectedJobSite(item)}
                    style={{
                      backgroundColor:
                        selectedJobSite?.id === item.id ? colors.primary : colors.surface,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          selectedJobSite?.id === item.id ? "white" : colors.foreground,
                        fontSize: 16,
                        fontWeight: "500",
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={{
                        color:
                          selectedJobSite?.id === item.id
                            ? "rgba(255,255,255,0.7)"
                            : colors.muted,
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      {item.location}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          </View>

          {/* Status Section */}
          {activeLog && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 8,
                padding: 16,
                borderLeftWidth: 4,
                borderLeftColor: colors.warning,
              }}
            >
              <Text className="text-sm text-muted mb-2">Currently Clocked In</Text>
              <Text className="text-lg font-semibold text-foreground mb-1">
                {getEmployeeName(activeLog.employeeId)}
              </Text>
              <Text className="text-sm text-muted mb-3">
                {getJobSiteName(activeLog.jobSiteId)}
              </Text>
              <Text className="text-2xl font-bold text-warning">
                {getElapsedTime(activeLog.clockInTime)}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="gap-3">
            {!activeLog ? (
              <Pressable
                onPress={handleClockIn}
                disabled={loading}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 16,
                  borderRadius: 8,
                  alignItems: "center",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <Text className="text-base font-semibold text-white">Clock In</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleClockOut}
                disabled={loading}
                style={{
                  backgroundColor: colors.error,
                  paddingVertical: 16,
                  borderRadius: 8,
                  alignItems: "center",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <Text className="text-base font-semibold text-white">Clock Out</Text>
              </Pressable>
            )}
          </View>

          {/* Message */}
          {message && (
            <View
              style={{
                backgroundColor: colors.success,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
              }}
            >
              <Text className="text-sm font-medium text-white text-center">{message}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
