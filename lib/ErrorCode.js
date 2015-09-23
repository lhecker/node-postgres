'use strict';

// Source: http://www.postgresql.org/docs/devel/static/errcodes-appendix.html


// Class 00 — Successful Completion
exports['00000'] = 'successful_completion';

// Class 01 — Warning
exports['01000'] = 'warning';
exports['0100C'] = 'dynamic_result_sets_returned';
exports['01008'] = 'implicit_zero_bit_padding';
exports['01003'] = 'null_value_eliminated_in_set_function';
exports['01007'] = 'privilege_not_granted';
exports['01006'] = 'privilege_not_revoked';
exports['01004'] = 'string_data_right_truncation';
exports['01P01'] = 'deprecated_feature';

// Class 02 — No Data (this is also a warning class per the SQL standard)
exports['02000'] = 'no_data';
exports['02001'] = 'no_additional_dynamic_result_sets_returned';

// Class 03 — SQL Statement Not Yet Complete
exports['03000'] = 'sql_statement_not_yet_complete';

// Class 08 — Connection Exception
exports['08000'] = 'connection_exception';
exports['08003'] = 'connection_does_not_exist';
exports['08006'] = 'connection_failure';
exports['08001'] = 'sqlclient_unable_to_establish_sqlconnection';
exports['08004'] = 'sqlserver_rejected_establishment_of_sqlconnection';
exports['08007'] = 'transaction_resolution_unknown';
exports['08P01'] = 'protocol_violation';

// Class 09 — Triggered Action Exception
exports['09000'] = 'triggered_action_exception';

// Class 0A — Feature Not Supported
exports['0A000'] = 'feature_not_supported';

// Class 0B — Invalid Transaction Initiation
exports['0B000'] = 'invalid_transaction_initiation';

// Class 0F — Locator Exception
exports['0F000'] = 'locator_exception';
exports['0F001'] = 'invalid_locator_specification';

// Class 0L — Invalid Grantor
exports['0L000'] = 'invalid_grantor';
exports['0LP01'] = 'invalid_grant_operation';

// Class 0P — Invalid Role Specification
exports['0P000'] = 'invalid_role_specification';

// Class 0Z — Diagnostics Exception
exports['0Z000'] = 'diagnostics_exception';
exports['0Z002'] = 'stacked_diagnostics_accessed_without_active_handler';

// Class 20 — Case Not Found
exports['20000'] = 'case_not_found';

// Class 21 — Cardinality Violation
exports['21000'] = 'cardinality_violation';

// Class 22 — Data Exception
exports['22000'] = 'data_exception';
exports['2202E'] = 'array_subscript_error';
exports['22021'] = 'character_not_in_repertoire';
exports['22008'] = 'datetime_field_overflow';
exports['22012'] = 'division_by_zero';
exports['22005'] = 'error_in_assignment';
exports['2200B'] = 'escape_character_conflict';
exports['22022'] = 'indicator_overflow';
exports['22015'] = 'interval_field_overflow';
exports['2201E'] = 'invalid_argument_for_logarithm';
exports['22014'] = 'invalid_argument_for_ntile_function';
exports['22016'] = 'invalid_argument_for_nth_value_function';
exports['2201F'] = 'invalid_argument_for_power_function';
exports['2201G'] = 'invalid_argument_for_width_bucket_function';
exports['22018'] = 'invalid_character_value_for_cast';
exports['22007'] = 'invalid_datetime_format';
exports['22019'] = 'invalid_escape_character';
exports['2200D'] = 'invalid_escape_octet';
exports['22025'] = 'invalid_escape_sequence';
exports['22P06'] = 'nonstandard_use_of_escape_character';
exports['22010'] = 'invalid_indicator_parameter_value';
exports['22023'] = 'invalid_parameter_value';
exports['2201B'] = 'invalid_regular_expression';
exports['2201W'] = 'invalid_row_count_in_limit_clause';
exports['2201X'] = 'invalid_row_count_in_result_offset_clause';
exports['2202H'] = 'invalid_tablesample_argument';
exports['2202G'] = 'invalid_tablesample_repeat';
exports['22009'] = 'invalid_time_zone_displacement_value';
exports['2200C'] = 'invalid_use_of_escape_character';
exports['2200G'] = 'most_specific_type_mismatch';
exports['22004'] = 'null_value_not_allowed';
exports['22002'] = 'null_value_no_indicator_parameter';
exports['22003'] = 'numeric_value_out_of_range';
exports['22026'] = 'string_data_length_mismatch';
exports['22001'] = 'string_data_right_truncation';
exports['22011'] = 'substring_error';
exports['22027'] = 'trim_error';
exports['22024'] = 'unterminated_c_string';
exports['2200F'] = 'zero_length_character_string';
exports['22P01'] = 'floating_point_exception';
exports['22P02'] = 'invalid_text_representation';
exports['22P03'] = 'invalid_binary_representation';
exports['22P04'] = 'bad_copy_file_format';
exports['22P05'] = 'untranslatable_character';
exports['2200L'] = 'not_an_xml_document';
exports['2200M'] = 'invalid_xml_document';
exports['2200N'] = 'invalid_xml_content';
exports['2200S'] = 'invalid_xml_comment';
exports['2200T'] = 'invalid_xml_processing_instruction';

// Class 23 — Integrity Constraint Violation
exports['23000'] = 'integrity_constraint_violation';
exports['23001'] = 'restrict_violation';
exports['23502'] = 'not_null_violation';
exports['23503'] = 'foreign_key_violation';
exports['23505'] = 'unique_violation';
exports['23514'] = 'check_violation';
exports['23P01'] = 'exclusion_violation';

// Class 24 — Invalid Cursor State
exports['24000'] = 'invalid_cursor_state';

// Class 25 — Invalid Transaction State
exports['25000'] = 'invalid_transaction_state';
exports['25001'] = 'active_sql_transaction';
exports['25002'] = 'branch_transaction_already_active';
exports['25008'] = 'held_cursor_requires_same_isolation_level';
exports['25003'] = 'inappropriate_access_mode_for_branch_transaction';
exports['25004'] = 'inappropriate_isolation_level_for_branch_transaction';
exports['25005'] = 'no_active_sql_transaction_for_branch_transaction';
exports['25006'] = 'read_only_sql_transaction';
exports['25007'] = 'schema_and_data_statement_mixing_not_supported';
exports['25P01'] = 'no_active_sql_transaction';
exports['25P02'] = 'in_failed_sql_transaction';

// Class 26 — Invalid SQL Statement Name
exports['26000'] = 'invalid_sql_statement_name';

// Class 27 — Triggered Data Change Violation
exports['27000'] = 'triggered_data_change_violation';

// Class 28 — Invalid Authorization Specification
exports['28000'] = 'invalid_authorization_specification';
exports['28P01'] = 'invalid_password';

// Class 2B — Dependent Privilege Descriptors Still Exist
exports['2B000'] = 'dependent_privilege_descriptors_still_exist';
exports['2BP01'] = 'dependent_objects_still_exist';

// Class 2D — Invalid Transaction Termination
exports['2D000'] = 'invalid_transaction_termination';

// Class 2F — SQL Routine Exception
exports['2F000'] = 'sql_routine_exception';
exports['2F005'] = 'function_executed_no_return_statement';
exports['2F002'] = 'modifying_sql_data_not_permitted';
exports['2F003'] = 'prohibited_sql_statement_attempted';
exports['2F004'] = 'reading_sql_data_not_permitted';

// Class 34 — Invalid Cursor Name
exports['34000'] = 'invalid_cursor_name';

// Class 38 — External Routine Exception
exports['38000'] = 'external_routine_exception';
exports['38001'] = 'containing_sql_not_permitted';
exports['38002'] = 'modifying_sql_data_not_permitted';
exports['38003'] = 'prohibited_sql_statement_attempted';
exports['38004'] = 'reading_sql_data_not_permitted';

// Class 39 — External Routine Invocation Exception
exports['39000'] = 'external_routine_invocation_exception';
exports['39001'] = 'invalid_sqlstate_returned';
exports['39004'] = 'null_value_not_allowed';
exports['39P01'] = 'trigger_protocol_violated';
exports['39P02'] = 'srf_protocol_violated';
exports['39P03'] = 'event_trigger_protocol_violated';

// Class 3B — Savepoint Exception
exports['3B000'] = 'savepoint_exception';
exports['3B001'] = 'invalid_savepoint_specification';

// Class 3D — Invalid Catalog Name
exports['3D000'] = 'invalid_catalog_name';

// Class 3F — Invalid Schema Name
exports['3F000'] = 'invalid_schema_name';

// Class 40 — Transaction Rollback
exports['40000'] = 'transaction_rollback';
exports['40002'] = 'transaction_integrity_constraint_violation';
exports['40001'] = 'serialization_failure';
exports['40003'] = 'statement_completion_unknown';
exports['40P01'] = 'deadlock_detected';

// Class 42 — Syntax Error or Access Rule Violation
exports['42000'] = 'syntax_error_or_access_rule_violation';
exports['42601'] = 'syntax_error';
exports['42501'] = 'insufficient_privilege';
exports['42846'] = 'cannot_coerce';
exports['42803'] = 'grouping_error';
exports['42P20'] = 'windowing_error';
exports['42P19'] = 'invalid_recursion';
exports['42830'] = 'invalid_foreign_key';
exports['42602'] = 'invalid_name';
exports['42622'] = 'name_too_long';
exports['42939'] = 'reserved_name';
exports['42804'] = 'datatype_mismatch';
exports['42P18'] = 'indeterminate_datatype';
exports['42P21'] = 'collation_mismatch';
exports['42P22'] = 'indeterminate_collation';
exports['42809'] = 'wrong_object_type';
exports['42703'] = 'undefined_column';
exports['42883'] = 'undefined_function';
exports['42P01'] = 'undefined_table';
exports['42P02'] = 'undefined_parameter';
exports['42704'] = 'undefined_object';
exports['42701'] = 'duplicate_column';
exports['42P03'] = 'duplicate_cursor';
exports['42P04'] = 'duplicate_database';
exports['42723'] = 'duplicate_function';
exports['42P05'] = 'duplicate_prepared_statement';
exports['42P06'] = 'duplicate_schema';
exports['42P07'] = 'duplicate_table';
exports['42712'] = 'duplicate_alias';
exports['42710'] = 'duplicate_object';
exports['42702'] = 'ambiguous_column';
exports['42725'] = 'ambiguous_function';
exports['42P08'] = 'ambiguous_parameter';
exports['42P09'] = 'ambiguous_alias';
exports['42P10'] = 'invalid_column_reference';
exports['42611'] = 'invalid_column_definition';
exports['42P11'] = 'invalid_cursor_definition';
exports['42P12'] = 'invalid_database_definition';
exports['42P13'] = 'invalid_function_definition';
exports['42P14'] = 'invalid_prepared_statement_definition';
exports['42P15'] = 'invalid_schema_definition';
exports['42P16'] = 'invalid_table_definition';
exports['42P17'] = 'invalid_object_definition';

// Class 44 — WITH CHECK OPTION Violation
exports['44000'] = 'with_check_option_violation';

// Class 53 — Insufficient Resources
exports['53000'] = 'insufficient_resources';
exports['53100'] = 'disk_full';
exports['53200'] = 'out_of_memory';
exports['53300'] = 'too_many_connections';
exports['53400'] = 'configuration_limit_exceeded';

// Class 54 — Program Limit Exceeded
exports['54000'] = 'program_limit_exceeded';
exports['54001'] = 'statement_too_complex';
exports['54011'] = 'too_many_columns';
exports['54023'] = 'too_many_arguments';

// Class 55 — Object Not In Prerequisite State
exports['55000'] = 'object_not_in_prerequisite_state';
exports['55006'] = 'object_in_use';
exports['55P02'] = 'cant_change_runtime_param';
exports['55P03'] = 'lock_not_available';

// Class 57 — Operator Intervention
exports['57000'] = 'operator_intervention';
exports['57014'] = 'query_canceled';
exports['57P01'] = 'admin_shutdown';
exports['57P02'] = 'crash_shutdown';
exports['57P03'] = 'cannot_connect_now';
exports['57P04'] = 'database_dropped';

// Class 58 — System Error (errors external to PostgreSQL itself)
exports['58000'] = 'system_error';
exports['58030'] = 'io_error';
exports['58P01'] = 'undefined_file';
exports['58P02'] = 'duplicate_file';

// Class F0 — Configuration File Error
exports['F0000'] = 'config_file_error';
exports['F0001'] = 'lock_file_exists';

// Class HV — Foreign Data Wrapper Error (SQL/MED)
exports['HV000'] = 'fdw_error';
exports['HV005'] = 'fdw_column_name_not_found';
exports['HV002'] = 'fdw_dynamic_parameter_value_needed';
exports['HV010'] = 'fdw_function_sequence_error';
exports['HV021'] = 'fdw_inconsistent_descriptor_information';
exports['HV024'] = 'fdw_invalid_attribute_value';
exports['HV007'] = 'fdw_invalid_column_name';
exports['HV008'] = 'fdw_invalid_column_number';
exports['HV004'] = 'fdw_invalid_data_type';
exports['HV006'] = 'fdw_invalid_data_type_descriptors';
exports['HV091'] = 'fdw_invalid_descriptor_field_identifier';
exports['HV00B'] = 'fdw_invalid_handle';
exports['HV00C'] = 'fdw_invalid_option_index';
exports['HV00D'] = 'fdw_invalid_option_name';
exports['HV090'] = 'fdw_invalid_string_length_or_buffer_length';
exports['HV00A'] = 'fdw_invalid_string_format';
exports['HV009'] = 'fdw_invalid_use_of_null_pointer';
exports['HV014'] = 'fdw_too_many_handles';
exports['HV001'] = 'fdw_out_of_memory';
exports['HV00P'] = 'fdw_no_schemas';
exports['HV00J'] = 'fdw_option_name_not_found';
exports['HV00K'] = 'fdw_reply_handle';
exports['HV00Q'] = 'fdw_schema_not_found';
exports['HV00R'] = 'fdw_table_not_found';
exports['HV00L'] = 'fdw_unable_to_create_execution';
exports['HV00M'] = 'fdw_unable_to_create_reply';
exports['HV00N'] = 'fdw_unable_to_establish_connection';

// Class P0 — PL/pgSQL Error
exports['P0000'] = 'plpgsql_error';
exports['P0001'] = 'raise_exception';
exports['P0002'] = 'no_data_found';
exports['P0003'] = 'too_many_rows';
exports['P0004'] = 'assert_failure';

// Class XX — Internal Error
exports['XX000'] = 'internal_error';
exports['XX001'] = 'data_corrupted';
exports['XX002'] = 'index_corrupted';
