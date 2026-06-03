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
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [selectedJobSite, setSelectedJobSite] = useState<JobSite | null>(null);
  const [activeLogs, setActiveLogs] = useState<TimeLog[]>([]);
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

      if (sites.length > 0 && !selectedJobSite) {
        setSelectedJobSite(sites[0]);
      }

      // Load all active logs
      const logs: TimeLog[] = [];
      for (const emp of emps) {
        const active = await getActiveTimeLog(emp.id);
        if (active) {
          logs.push(active);
        }
      }
      setActiveLogs(logs);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleClockInMultiple = async () => {
    if (selectedEmployees.size === 0 || !selectedJobSite) {
      setMessage("Please select employees and job site");
      return;
    }

    try {
      setLoading(true);
      for (const empId of selectedEmployees) {
        await addTimeLog(empId, selectedJobSite.id);
      }
      setSelectedEmployees(new Set());
      await loadData();
      setMessage(`Clocked in ${selectedEmployees.size} employee(s)`);
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      setMessage("Error clocking in");
      console.error("Error clocking in:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async (logId: string) => {
    try {
      setLoading(true);
      await clockOutTimeLog(logId);
      await loadData();
      setMessage("Clocked out successfully");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      setMessage("Error clocking out");
      console.error("Error clocking out:", error);
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
            <Text className="text-sm text-muted">Select employees and job site</Text>
          </View>

          {/* Employee Selection - Multiple */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-foreground">
              Select Employees ({selectedEmployees.size})
            </Text>
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
                    onPress={() => toggleEmployeeSelection(item.id)}
                    style={{
                      backgroundColor: selectedEmployees.has(item.id)
                        ? colors.primary
                        : colors.surface,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: selectedEmployees.has(item.id)
                          ? "white"
                          : colors.foreground,
                        fontSize: 16,
                        fontWeight: "500",
                      }}
                    >
                      {item.name}
                    </Text>
                    {selectedEmployees.has(item.id) && (
                      <Text style={{ color: "white", fontSize: 18 }}>✓</Text>
                    )}
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

          {/* Active Clocks Section */}
          {activeLogs.length > 0 && (
            <View className="gap-2">
              <Text className="text-base font-semibold text-foreground">
                Currently Clocked In ({activeLogs.length})
              </Text>
              <FlatList
                data={activeLogs}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 8,
                      borderLeftWidth: 4,
                      borderLeftColor: colors.warning,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: colors.foreground,
                            marginBottom: 2,
                          }}
                        >
                          {getEmployeeName(item.employeeId)}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.muted,
                            marginBottom: 4,
                          }}
                        >
                          {getJobSiteName(item.jobSiteId)}
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            color: colors.warning,
                          }}
                        >
                          {getElapsedTime(item.clockInTime)}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleClockOut(item.id)}
                        disabled={loading}
                        style={{
                          backgroundColor: colors.error,
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                          opacity: loading ? 0.6 : 1,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 12,
                            fontWeight: "600",
                          }}
                        >
                          Clock Out
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              />
            </View>
          )}

          {/* Action Button */}
          <Pressable
            onPress={handleClockInMultiple}
            disabled={loading || selectedEmployees.size === 0}
            style={{
              backgroundColor:
                selectedEmployees.size === 0 ? colors.border : colors.primary,
              paddingVertical: 16,
              borderRadius: 8,
              alignItems: "center",
              opacity: loading || selectedEmployees.size === 0 ? 0.6 : 1,
            }}
          >
            <Text className="text-base font-semibold text-white">
              Clock In {selectedEmployees.size > 0 ? `(${selectedEmployees.size})` : ""}
            </Text>
          </Pressable>

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
